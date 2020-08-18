import { ComponentPublicInstance } from 'vue';
import { pascalCase } from '../index';
import _ from 'lodash';

export function getListener<T extends Function = Function>(
  instance: ComponentPublicInstance,
  name: string
): T | undefined {
  const pascalName = pascalCase(name.replace(/^on/, ''));
  const { props } = instance.$.vnode;
  const names = [
    `on${pascalName}`,
    `on${pascalName[0]}${_.kebabCase(pascalName.slice(1))}`
  ];

  for (const handlerName of names) {
    if (typeof props[handlerName] === 'function') {
      return props[handlerName] as T;
    }
  }
}

export function getListeners<T extends Function = Function>(
  instance: ComponentPublicInstance,
  ...names: string[]
) {
  return names.map<T | undefined>((name) => getListener<T>(instance, name));
}
