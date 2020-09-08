import ResizeObserver from 'resize-observer-polyfill';
import { MenuMode } from './interface';
import SubMenu from './SubMenu';

import {
  CSSProperties,
  VNodeChild,
  VNode,
  defineComponent,
  cloneVNode
} from 'vue';

import { getPropOrSlot } from '@ayase/vc-util/lib/instance';
import { getWidth, setStyle, menuAllProps } from './util';
import { normalizeClass } from '@vue/shared';
import { pascalCase } from '@ayase/vc-util';
import _ from 'lodash';

const MENUITEM_OVERFLOWED_CLASSNAME = 'menuitem-overflowed';
const FLOAT_PRECISION_ADJUST = 0.5;

interface DOMWrapProps {
  // className?: string;
  // children?: React.ReactElement[];
  mode?: MenuMode;
  prefixCls?: string;
  level?: number;
  theme?: string;
  overflowedIndicator?: VNodeChild;
  visible?: boolean;
  tag?: string;
  // style?: React.CSSProperties;
}

interface DOMWrapState {
  lastVisibleIndex: number;
}

export default defineComponent<DOMWrapProps, {}, { state: DOMWrapState }>({
  name: 'DOMWrap',

  props: {
    mode: { type: String },
    prefixCls: { type: String },
    level: { type: Number },
    theme: { type: String },
    overflowedIndicator: { type: undefined },
    visible: { type: Boolean },
    tag: { type: String, default: 'div' }
  } as undefined,

  created() {
    // original scroll size of the list
    this.originalTotalWidth = 0;

    // copy of overflowed items
    this.overflowedItems = [];

    // cache item of the original items (so we can track the size and order)
    this.menuItemSizes = [];
  },

  data() {
    return {
      state: {
        lastVisibleIndex: undefined
      }
    };
  },

  mounted() {
    this.setChildrenWidthAndResize();

    if (this.$props.level === 1 && this.$props.mode === 'horizontal') {
      const menuUl: HTMLElement = this.$el;

      if (!menuUl) {
        return;
      }

      this.resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(() => {
          const { cancelFrameId } = this;

          cancelAnimationFrame(cancelFrameId);

          this.cancelFrameId = requestAnimationFrame(
            this.setChildrenWidthAndResize
          );
        });
      });

      [].slice
        .call(menuUl.children)
        .concat(menuUl)
        .forEach((el: HTMLElement) => {
          this.resizeObserver.observe(el);
        });

      if (typeof MutationObserver !== 'undefined') {
        this.mutationObserver = new MutationObserver(() => {
          this.resizeObserver.disconnect();
          [].slice
            .call(menuUl.children)
            .concat(menuUl)
            .forEach((el: HTMLElement) => {
              this.resizeObserver.observe(el);
            });
          this.setChildrenWidthAndResize();
        });

        this.mutationObserver.observe(menuUl, {
          attributes: false,
          childList: true,
          subTree: false
        });
      }
    }
  },

  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    cancelAnimationFrame(this.cancelFrameId);
  },

  methods: {
    // get all valid menuItem nodes
    getMenuItemNodes(): HTMLElement[] {
      const { prefixCls }: DOMWrapProps = this.$props;
      const ul = this.$el;

      if (!ul) {
        return [];
      }

      // filter out all overflowed indicator placeholder
      return [].slice
        .call(ul.children)
        .filter(
          (node: HTMLElement) =>
            node.className
              .split(' ')
              .indexOf(`${prefixCls}-overflowed-submenu`) < 0
        );
    },

    getOverflowedSubMenuItem(
      keyPrefix: string,
      overflowedItems: VNode[],
      renderPlaceholder?: boolean
    ) {
      const { level, mode, prefixCls, theme }: DOMWrapProps = this.$props;
      const overflowedIndicator = getPropOrSlot(this, 'overflowedIndicator');

      if (level !== 1 || mode !== 'horizontal') {
        return null;
      }

      // put all the overflowed item inside a submenu
      // with a title of overflow indicator ('...')
      const copy: VNode = this.children[0];
      const { title, style: propStyle, ...rest } = copy.props;

      let style: CSSProperties = { ...propStyle };
      let key = `${keyPrefix}-overflowed-indicator`;
      let eventKey = `${keyPrefix}-overflowed-indicator`;

      if (overflowedItems.length === 0 && renderPlaceholder !== true) {
        style = { ...style, display: 'none' };
      } else if (renderPlaceholder) {
        style = {
          ...style,
          visibility: 'hidden',
          // prevent from taking normal dom space
          position: 'absolute'
        };

        key = `${key}-placeholder`;
        eventKey = `${eventKey}-placeholder`;
      }

      const popupClass = theme ? `${prefixCls}-${theme}` : '';
      const props = {};

      menuAllProps.forEach((k) => {
        if (rest[k] !== undefined) {
          props[k] = rest[k];
        } else if (k.startsWith('on')) {
          const n = pascalCase(k.replace(/^on/, ''));

          for (const h of [
            `on${n}`,
            `on${n[0]}${_.kebabCase(n.slice(1))}`,
            `on${n[0]}${n.slice(1).toLowerCase()}`
          ]) {
            if (rest[n] !== undefined) {
              props[n] = rest[n];
              break;
            }
          }
        }
      });

      const subMenuProps = {
        title: overflowedIndicator,
        class: `${prefixCls}-overflowed-submenu`,
        popupClass,
        ...props,
        key,
        eventKey,
        disabled: false,
        style
      };

      return <SubMenu {...subMenuProps}>{overflowedItems}</SubMenu>;
    },

    // memorize rendered menuSize
    setChildrenWidthAndResize() {
      if (this.$props.mode !== 'horizontal') {
        return;
      }

      const ul: HTMLElement = this.$el;

      if (!ul) {
        return;
      }

      const ulChildrenNodes = ul.children;

      if (!ulChildrenNodes || ulChildrenNodes.length === 0) {
        return;
      }

      const lastOverflowedIndicatorPlaceholder = ul.children[
        ulChildrenNodes.length - 1
      ] as HTMLElement;

      // need last overflowed indicator for calculating length;
      setStyle(lastOverflowedIndicatorPlaceholder, 'display', 'inline-block');

      const menuItemNodes = this.getMenuItemNodes();

      // reset display attribute for all hidden elements caused by overflow to calculate updated width
      // and then reset to original state after width calculation

      const overflowedItems = menuItemNodes.filter(
        (c) =>
          c.className.split(' ').indexOf(MENUITEM_OVERFLOWED_CLASSNAME) >= 0
      );

      overflowedItems.forEach((c) => {
        setStyle(c, 'display', 'inline-block');
      });

      this.menuItemSizes = menuItemNodes.map((c) => getWidth(c, true));

      overflowedItems.forEach((c) => {
        setStyle(c, 'display', 'none');
      });

      this.overflowedIndicatorWidth = getWidth(
        ul.children[ul.children.length - 1] as HTMLElement,
        true
      );

      this.originalTotalWidth = this.menuItemSizes.reduce(
        (acc, cur) => acc + cur,
        0
      );

      this.handleResize();

      // prevent the overflowed indicator from taking space;
      setStyle(lastOverflowedIndicatorPlaceholder, 'display', 'none');
    },

    handleResize() {
      if (this.$props.mode !== 'horizontal') {
        return;
      }

      const ul: HTMLElement = this.$el;

      if (!ul) {
        return;
      }

      const width = getWidth(ul);

      this.overflowedItems = [];
      let currentSumWidth = 0;

      // index for last visible child in horizontal mode
      let lastVisibleIndex: number;

      // float number comparison could be problematic
      // e.g. 0.1 + 0.2 > 0.3 =====> true
      // thus using FLOAT_PRECISION_ADJUST as buffer to help the situation
      if (this.originalTotalWidth > width + FLOAT_PRECISION_ADJUST) {
        lastVisibleIndex = -1;

        this.menuItemSizes.forEach((liWidth) => {
          currentSumWidth += liWidth;

          if (currentSumWidth + this.overflowedIndicatorWidth <= width) {
            lastVisibleIndex += 1;
          }
        });
      }

      this.state.lastVisibleIndex = lastVisibleIndex;
    },

    renderChildren(children: VNode[]) {
      // need to take care of overflowed items in horizontal mode
      const { lastVisibleIndex }: DOMWrapState = this.state;

      return (children || []).reduce<VNode[]>((acc, childNode, index) => {
        let item = childNode;

        if (this.$props.mode === 'horizontal') {
          let overflowed = this.getOverflowedSubMenuItem(
            childNode.props.eventKey,
            []
          );

          if (
            lastVisibleIndex !== undefined &&
            normalizeClass(this.$.vnode.props.class).indexOf(
              `${this.$props.prefixCls}-root`
            ) !== -1
          ) {
            if (index > lastVisibleIndex) {
              console.log(childNode);
              item = cloneVNode(
                childNode,
                // 这里修改 eventKey 是为了防止隐藏状态下还会触发 openkeys 事件
                {
                  style: { display: 'none' },
                  eventKey: `${childNode.props.eventKey}-hidden`,
                  /**
                   * Legacy code. Here `className` never used:
                   * https://github.com/react-component/menu/commit/4cd6b49fce9d116726f4ea00dda85325d6f26500#diff-e2fa48f75c2dd2318295cde428556a76R240
                   */
                  class: `${MENUITEM_OVERFLOWED_CLASSNAME}`
                }
              );

              console.log(item);
            }

            if (index === lastVisibleIndex + 1) {
              this.overflowedItems = children
                .slice(lastVisibleIndex + 1)
                .map((c) =>
                  cloneVNode(
                    c,
                    // children[index].key will become '.$key' in clone by default,
                    // we have to overwrite with the correct key explicitly
                    { key: c.props.eventKey, mode: 'vertical-left' }
                  )
                );

              console.log('overflowedItems', this.overflowedItems);

              overflowed = this.getOverflowedSubMenuItem(
                childNode.props.eventKey,
                this.overflowedItems
              );
            }
          }

          const ret: VNode[] = [...acc, overflowed, item];

          if (index === children.length - 1) {
            // need a placeholder for calculating overflowed indicator width
            ret.push(
              this.getOverflowedSubMenuItem(childNode.props.eventKey, [], true)
            );
          }

          return ret;
        }

        return [...acc, item];
      }, []);
    }
  },

  render() {
    this.children = this.$slots.default();

    const {
      visible,
      prefixCls,
      overflowedIndicator,
      mode,
      level,
      tag,
      theme,
      ...rest
    }: DOMWrapProps = this.$props;

    const Tag = tag as any;
    const tagProps = { ...rest, ...this.$attrs };

    return <Tag {...tagProps}>{this.renderChildren(this.children)}</Tag>;
  }
});
