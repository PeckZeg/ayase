import { ComponentPublicInstance, VNodeChild, Slot } from 'vue';

import { getVNodeListener, getVNodeStyle } from './vnode';
import _ from 'lodash';

export function getListener<T extends Function = Function>(
  instance: ComponentPublicInstance,
  name: string
): T | undefined {
  return getVNodeListener<T>(instance.$.vnode, name);
}

export function getListeners<T extends Function = Function>(
  instance: ComponentPublicInstance,
  ...names: string[]
) {
  return names.map<T | undefined>((name) => getListener<T>(instance, name));
}

export function getPropOrSlot(
  instance: ComponentPublicInstance,
  name: string,
  rendered = true
): VNodeChild | (() => VNodeChild) | Slot | undefined {
  for (const caseFunc of [_.camelCase, _.kebabCase]) {
    const caseName = caseFunc(name);
    const propOrSlot =
      instance.$props[caseName] !== undefined
        ? instance.$props[caseName]
        : instance.$slots[caseName];

    if (propOrSlot !== undefined) {
      if (rendered) {
        return typeof propOrSlot === 'function' ? propOrSlot() : propOrSlot;
      }

      return propOrSlot;
    }
  }
}

export function getStyle(instance: ComponentPublicInstance) {
  return getVNodeStyle(instance.$.vnode);
}
