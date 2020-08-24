import { AlignType, AlignResult, TargetType, TargetPoint } from './interface';

import addEventListener from '@ayase/vc-util/lib/Dom/addEventListener';
import { isSamePoint, restoreFocus, monitorResize } from './util';
import { alignElement, alignPoint } from 'dom-align';
import useBuffer from './hooks/useBuffer';

import {
  Ref,
  onBeforeUnmount,
  defineComponent,
  watchEffect,
  cloneVNode,
  isVNode,
  watch,
  toRef,
  ref
} from 'vue';
import { composeRef, getRefElement } from '@ayase/vc-util/lib/ref';

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

export interface AlignRawBindings {
  forceAlign: ReturnType<typeof useBuffer>[0];
  nodeRef: Ref<any>;
}

function getElement(func: TargetType) {
  if (typeof func !== 'function') return null;
  return func();
}

function getPoint(point: TargetType) {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

export default defineComponent<AlignProps, AlignRawBindings>({
  props: {
    align: { type: undefined },
    target: { type: undefined },
    monitorBufferTime: { type: Number },
    monitorWindowResize: { type: Boolean },
    disabled: { type: Boolean, default: false }
  } as undefined,

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
      [toRef(props, 'disabled'), toRef(props, 'target')] as const,
      ([disabled, target]) => {
        forceAlignPropsRef.value.disabled = disabled;
        forceAlignPropsRef.value.target = target;
      }
    );

    const [forceAlign, cancelForceAlign] = useBuffer(() => {
      const {
        disabled: latestDisabled,
        target: latestTarget
      } = forceAlignPropsRef.value;

      if (!latestDisabled && latestTarget) {
        const source = getRefElement(nodeRef);

        if (!source) {
          return;
        }

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
      const nodeRefElem = getRefElement(nodeRef);

      if (nodeRefElem !== sourceResizeMonitor.value.element) {
        sourceResizeMonitor.value.cancel();
        sourceResizeMonitor.value.element = nodeRefElem;
        sourceResizeMonitor.value.cancel = monitorResize(
          nodeRefElem,
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
    // useImperativeHandle({
    //   forceAlign: () => forceAlign(true)
    // });

    return { forceAlign, nodeRef };
  },

  // ===================== Render =====================
  render(ctx) {
    let childNode = ctx.$slots.default()[0];

    const a = childNode.ref;

    if (isVNode(childNode)) {
      childNode = cloneVNode(childNode, {
        ref: composeRef('nodeRef', childNode.ref)
      });
    }

    return childNode;
  }
});
