import { ComponentPublicInstance, VNode, Slot } from 'vue';

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
  name: string
): VNode | VNode[] | Slot {
  const camelCaseName = _.camelCase(name);

  if (instance.$props[camelCaseName] !== undefined) {
    return instance.$props[camelCaseName];
  }

  if (instance.$slots[camelCaseName] !== undefined) {
    return instance.$slots[camelCaseName];
  }

  const kebabCaseName = _.kebabCase(name);

  if (instance.$slots[kebabCaseName] !== undefined) {
    return instance.$slots[kebabCaseName];
  }
}

export function getStyle(instance: ComponentPublicInstance) {
  return getVNodeStyle(instance.$.vnode);
}
