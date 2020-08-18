import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/vue/mixins';
import { VNode, Component, Fragment, defineComponent } from 'vue';
import OriginCSSMotion, { CSSMotionProps } from './CSSMotion';

import { supportTransition } from './util/motion';
import _ from 'lodash';

import {
  STATUS_ADD,
  STATUS_KEEP,
  STATUS_REMOVE,
  STATUS_REMOVED,
  diffKeys,
  parseKeys,
  KeyObject
} from './util/diff';
import { getListener } from '@ayase/vc-util/lib/vue/instance';

const MOTION_PROP_NAMES = [
  'eventProps',
  'visible',
  'children',
  'motionName',
  'motionAppear',
  'motionEnter',
  'motionLeave',
  'motionLeaveImmediately',
  'motionDeadline',
  'removeOnLeave',
  'leavedClassName',
  'onAppearStart',
  'onAppearActive',
  'onAppearEnd',
  'onEnterStart',
  'onEnterActive',
  'onEnterEnd',
  'onLeaveStart',
  'onLeaveActive',
  'onLeaveEnd'
].reduce<string[]>((acc, prop) => {
  acc.push(prop);

  if (/^on/.test(prop)) {
    prop = prop.replace(/^on/, '');
    acc.push(`on${prop[0]}${_.kebabCase(prop.slice(1))}`);
  } else {
    acc.push(_.kebabCase(prop));
  }

  return acc;
}, []);

export interface CSSMotionListProps extends CSSMotionProps {
  keys: (VNode['key'] | { key: VNode['key']; [name: string]: any })[];
  component?: string | Component | false;
}

export interface CSSMotionListState {
  keyEntities: KeyObject[];
}

export function genCSSMotionList(
  transitionSupport: boolean,
  CSSMotion = OriginCSSMotion
) {
  return defineComponent<CSSMotionListProps, {}, { state: CSSMotionListState }>(
    {
      name: 'CSSMotionList',
      mixins: [DerivedStateFromPropsMixin],

      props: {
        keys: { type: undefined },
        component: { type: undefined, default: 'div' }
      } as undefined,

      data() {
        return {
          state: {
            keyEntities: []
          }
        };
      },

      getDerivedStateFromProps(
        { keys }: CSSMotionListProps,
        { keyEntities }: CSSMotionListState
      ) {
        const parsedKeyObjects = parseKeys(keys);

        // Always as keep when motion not support
        if (!transitionSupport) {
          return {
            keyEntities: parsedKeyObjects.map((obj) => ({
              ...obj,
              status: STATUS_KEEP
            }))
          };
        }

        const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
        const keyEntitiesLen = keyEntities.length;

        return {
          keyEntities: mixedKeyEntities.filter((entity) => {
            // IE 9 not support Array.prototype.find
            let prevEntity = null;
            for (let i = 0; i < keyEntitiesLen; i += 1) {
              const currentEntity = keyEntities[i];
              if (currentEntity.key === entity.key) {
                prevEntity = currentEntity;
                break;
              }
            }

            // Remove if already mark as removed
            if (
              prevEntity &&
              prevEntity.status === STATUS_REMOVED &&
              entity.status === STATUS_REMOVE
            ) {
              return false;
            }
            return true;
          })
        };
      },

      methods: {
        removeKey(removeKey: VNode['key']) {
          this.state.keyEntities = this.state.keyEntities.map((entity) => {
            if (entity.key !== removeKey) {
              return entity;
            }

            return { ...entity, status: STATUS_REMOVED };
          });
        }
      },

      render(ctx) {
        const { keyEntities } = ctx.state as CSSMotionListState;
        const { component } = ctx.$props as CSSMotionListProps;
        const children = ctx.$slots.default;

        const Component = (component || Fragment) as string;

        const restProps = { ...ctx.$attrs };
        const motionProps: CSSMotionProps = {};

        MOTION_PROP_NAMES.forEach((prop) => {
          if (prop in restProps) {
            motionProps[prop] = restProps[prop];
          }

          delete restProps[prop];
        });

        return (
          <Component {...restProps}>
            {keyEntities.map(({ status, ...eventProps }) => {
              const visible = status === STATUS_ADD || status === STATUS_KEEP;

              return (
                <CSSMotion
                  {...motionProps}
                  key={eventProps.key}
                  visible={visible}
                  eventProps={eventProps}
                  // @ts-ignore
                  onLeaveEnd={(...args) => {
                    const onLeaveEnd = getListener(this, 'onLeaveEnd');

                    if (onLeaveEnd) {
                      onLeaveEnd(...args);
                    }

                    this.removeKey(eventProps.key);
                  }}
                  v-slots={{ default: children }}
                />
              );
            })}
          </Component>
        );
      }
    }
  );
}

export default genCSSMotionList(supportTransition);
