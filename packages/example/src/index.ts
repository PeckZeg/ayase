import { AlignType, AlignResult, TargetType, TargetPoint } from './interface';

import addEventListener from '@ayase/vc-util/lib/Dom/addEventListener';
import { isSamePoint, restoreFocus, monitorResize } from './util';
import { alignElement, alignPoint } from 'dom-align';
import { composeRef } from '@ayase/vc-util/lib/ref';
import {
  defineComponent,
  h,
  ref,
  computed,
  watchEffect,
  getCurrentInstance,
  onBeforeUnmount,
  isVNode,
  cloneVNode,
  toRef,
  watch,
  toRefs,
  onUpdated
} from 'vue';
import useBuffer from './hooks/useBuffer';
import VueTypes from 'vue-types';

type OnAlign = (source: HTMLElement, result: AlignResult) => void;

export interface AlignProps {
  align: AlignType;
  target: TargetType;
  monitorBufferTime?: number;
  monitorWindowResize?: boolean;
  disabled?: boolean;
}

interface MonitorRef {
  element?: HTMLElement;
  cancel: () => void;
}

export interface RefAlign {
  forceAlign: () => void;
}

function getElement(func: TargetType) {
  if (typeof func !== 'function') return null;
  return func();
}

function getPoint(point: TargetType) {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

function useImperativeHandle(object: any) {
  const currentInstance = getCurrentInstance();

  Object.defineProperties(
    currentInstance.proxy,
    Object.keys(object).reduce((acc, key) => {
      acc[key] = {
        value: object[key],
        configurable: false,
        enumerable: true,
        writable: false
      };

      return acc;
    }, {})
  );
}

export default defineComponent({
  props: {
    align: { type: undefined },
    target: { type: undefined },
    monitorBufferTime: { type: undefined },
    monitorWindowResize: { type: undefined },
    disabled: { type: Boolean, default: false }
  },

  emits: ['align'],

  setup(props, ctx) {
    const onAlign: OnAlign = (...args) => ctx.emit('align', ...args);

    const cacheRef = ref<{ element?: HTMLElement; point?: TargetPoint }>({});
    const nodeRef = ref();

    // ===================== Align ======================
    // We save the props here to avoid closure makes props ood
    const forceAlignPropsRef = ref<{
      disabled?: boolean;
      target?: TargetType;
      onAlign?: OnAlign;
    }>({
      disabled: props.disabled,
      target: props.target,
      onAlign
    });

    watch(
      [toRef(props, 'disabled'), toRef(props, 'target')],
      ([disabled, target]) => {
        forceAlignPropsRef.value.disabled = disabled;
        forceAlignPropsRef.value.target = target;
        console.log(target, target.value);
      }
    );

    const [forceAlign, cancelForceAlign] = useBuffer(() => {
      const {
        disabled: latestDisabled,
        target: latestTarget
      } = forceAlignPropsRef.value;

      if (!latestDisabled && latestTarget) {
        const source = nodeRef.value;

        let result: AlignResult;
        const element = getElement(latestTarget);
        const point = getPoint(latestTarget);

        cacheRef.value.element = element;
        cacheRef.value.point = point;

        // IE lose focus after element realign
        // We should record activeElement and restore later
        const { activeElement } = document;

        if (element) {
          result = alignElement(source, element, props.align);
        } else if (point) {
          result = alignPoint(source, point, props.align);
        }

        restoreFocus(activeElement as HTMLElement, source);
        onAlign(source, result);

        return true;
      }

      return false;
    }, props.monitorBufferTime ?? 0);

    // ===================== Effect =====================
    // Listen for target updated
    const resizeMonitor = ref<MonitorRef>({ cancel: () => {} });

    // Listen for source updated
    const sourceResizeMonitor = ref<MonitorRef>({ cancel: () => {} });

    watchEffect(() => {
      const element = getElement(props.target);
      const point = getPoint(props.target);

      if (nodeRef.value !== sourceResizeMonitor.value.element) {
        sourceResizeMonitor.value.cancel();
        sourceResizeMonitor.value.element = nodeRef.value;
        sourceResizeMonitor.value.cancel = monitorResize(
          nodeRef.value,
          forceAlign
        );
      }

      if (
        cacheRef.value.element !== element ||
        !isSamePoint(cacheRef.value.point, point)
      ) {
        forceAlign();
        // Add resize observer
        if (resizeMonitor.value.element !== element) {
          resizeMonitor.value.cancel();
          resizeMonitor.value.element = element;
          resizeMonitor.value.cancel = monitorResize(element, forceAlign);
        }
      }
    });

    // Listen for disabled change
    watch(toRef(props, 'disabled'), (disabled) => {
      if (!disabled) {
        forceAlign();
      } else {
        cancelForceAlign();
      }
    });

    // Listen for window resize
    const winResizeRef = ref<{ remove: Function }>(null);

    watchEffect(() => {
      if (props.monitorWindowResize) {
        if (!winResizeRef.value) {
          winResizeRef.value = addEventListener(
            window as any,
            'resize',
            forceAlign as any
          );
        }
      } else if (winResizeRef.value) {
        winResizeRef.value.remove();
        winResizeRef.value = null;
      }
    });

    // Clear all if unmount
    onBeforeUnmount(() => {
      resizeMonitor.value.cancel();
      sourceResizeMonitor.value.cancel();
      if (winResizeRef.value) winResizeRef.value.remove();
      cancelForceAlign();
    });

    // ====================== Ref =======================
    useImperativeHandle({
      forceAlign: () => forceAlign(true)
    });

    return { nodeRef };
  },

  // ===================== Render =====================
  render(ctx) {
    let childNode = ctx.$slots.default()[0];

    if (isVNode(childNode)) {
      childNode = cloneVNode(childNode, {
        ref: 'nodeRef'
      });
    }

    return childNode;
  }
});
