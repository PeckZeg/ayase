import { Component, Ref, inject, defineComponent } from 'vue';
import { DefaultRootState, Store } from './types';
import { MiniStoreContext } from './Provider';

import shallowEqual from 'shallowequal';
import { DerivedStateFromPropsMixin } from '@ayase/vc-util/lib/mixins';

export interface ConnectOptions {
  /**
   * If true, use React's forwardRef to expose a ref of the wrapped component
   *
   * @default false
   */
  forwardRef?: boolean;
}

/**
 * Infers the type of props that a connector will inject into a component.
 */
export interface ConnectProps {
  miniStoreForwardedRef: Ref<any>;
}

export interface ConnectedState<TStateProps = {}, Store = {}, TOwnProps = {}> {
  subscribed: TStateProps;
  // store: Store;
  props: TOwnProps;
}

export interface ConnectedRawBindings<T> {
  store: Store<T>;
}

function getDisplayName(WrappedComponent: Component) {
  return WrappedComponent.name || 'Component';
}

function getConnectedProps<Props>(vm: any): Props {
  return { ...vm.$props, ...vm.$attrs };
}

const defaultMapStateToProps = () => ({});

export function connect<
  TStateProps = {},
  TOwnProps = {},
  State = DefaultRootState
>(
  mapStateToProps?: (state: State, ownProps: TOwnProps) => TStateProps,
  options: ConnectOptions = {}
) {
  const shouldSubscribe = !!mapStateToProps;
  const finalMapStateToProps =
    mapStateToProps || (defaultMapStateToProps as () => TStateProps);

  return function wrapWithConnect(WrappedComponent: Component) {
    return defineComponent<
      TOwnProps & ConnectProps,
      ConnectedRawBindings<State>,
      { state: ConnectedState<TStateProps, Store<State>, TOwnProps> }
    >({
      name: `Connect(${getDisplayName(WrappedComponent)})`,
      mixins: [DerivedStateFromPropsMixin],
      inheritAttrs: false,

      setup() {
        return {
          store: inject(MiniStoreContext)
        };
      },

      data(vm) {
        return {
          state: {
            subscribed: Object.freeze(
              finalMapStateToProps(
                (vm as any).store.getState(),
                getConnectedProps<TOwnProps>(vm)
              )
            ),
            props: getConnectedProps<TOwnProps>(vm)
          }
        };
      },

      getDerivedStateFromProps(
        nextProps: TOwnProps,
        prevState: ConnectedState<TStateProps, Store<State>, TOwnProps>
      ) {
        const props = { ...nextProps, ...this.$attrs };

        // using ownProps
        if (
          mapStateToProps &&
          mapStateToProps.length === 2 &&
          !shallowEqual(props, prevState.props)
        ) {
          return {
            subscribed: Object.freeze(
              finalMapStateToProps(this.store.getState(), props)
            ),
            props
          };
        }

        return { props };
      },

      mounted() {
        this.trySubscribe();
      },

      beforeUnmount() {
        this.tryUnsubscribe();
      },

      methods: {
        handleChange() {
          if (!this.unsubscribe) {
            return;
          }

          const nextSubscribed = finalMapStateToProps(
            this.store.getState(),
            getConnectedProps<TOwnProps>(this)
          );

          if (!shallowEqual(nextSubscribed, this.state.subscribed)) {
            this.state.subscribed = Object.freeze(nextSubscribed);
          }
        },

        trySubscribe() {
          if (shouldSubscribe) {
            this.unsubscribe = this.store.subscribe(this.handleChange);
            this.handleChange();
          }
        },

        tryUnsubscribe() {
          if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
          }
        }
      },

      render() {
        const props = {
          ...this.$props,
          ...this.$attrs,
          ...this.state.subscribed,
          store: this.store
        };

        return (
          // @ts-ignore
          <WrappedComponent
            {...props}
            ref={this.$attrs.miniStoreForwardedRef}
            v-slots={{ ...this.$slots }}
          />
        );
      }
    });
  };
}
