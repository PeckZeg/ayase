import { Ref, watchEffect, ref } from 'vue';

export function fillRef<T>(ref: Ref<T>, node: T) {
  if (typeof ref === 'function') {
    (ref as Function)(node);
  } else if (typeof ref === 'object' && ref && (ref as any).__v_isRef) {
    ref.value = node;
  }
}

/**
 * Merge refs into one ref function to support ref passing.
 */
export function composeRef<T>(...refs: Ref<T>[]): Ref<T> {
  const node = ref<T>();

  watchEffect(() => {
    refs.forEach((ref) => {
      fillRef(ref, node.value);
    });
  });

  return node;
}
