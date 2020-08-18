import { VNodeProps, VNode, Ref, getCurrentInstance, watch, ref } from 'vue';

/**
 * Merge refs into one ref function to support ref passing.
 */
export function composeRef(...refs: Array<VNodeProps['ref'] | VNode['ref']>) {
  const watchRef = ref(null);

  const cacheRefs = ref(
    refs.reduce((acc, customRef) => {
      if (customRef == null) {
        return acc;
      }

      if (Array.isArray(customRef)) {
        acc.push((customRef as any) as VNode['ref']);
      } else {
        acc.push([getCurrentInstance(), customRef]);
      }

      return acc;
    }, [] as VNode['ref'][])
  );

  watch(watchRef, (node) => {
    cacheRefs.value.forEach(([instance, customRef]) => {
      if (typeof customRef === 'function') {
        (customRef as Function)(node);
      } else if (typeof customRef === 'string') {
        if (customRef in (instance as any).setupState) {
          (instance as any).setupState[customRef] = node;
        }
      }
    });
  });

  return watchRef;
}

export function getRefElement<T extends HTMLElement, R = any>(ref: Ref<R>): T {
  return ref.value ? (ref.value as any).$el || ref.value : ref.value;
}
