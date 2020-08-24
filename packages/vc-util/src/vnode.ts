import { CSSProperties, VNode } from 'vue';

import { pascalCase } from '.';
import _ from 'lodash';

export function getVNodeListener<T extends Function = Function>(
  vnode: VNode,
  name: string
) {
  if (!vnode || !vnode.props) {
    return null;
  }

  const pascalName = pascalCase(name.replace(/^on/, ''));
  let handlerName = `on${pascalName}`;

  if (typeof vnode.props[handlerName] === 'function') {
    return vnode.props[handlerName] as T;
  }

  handlerName = `on${pascalName[0]}${_.kebabCase(pascalName.slice(1))}`;

  if (typeof vnode.props[handlerName] === 'function') {
    return vnode.props[handlerName] as T;
  }

  handlerName = `on${pascalName[0]}${pascalName.slice(1).toLowerCase()}`;

  if (typeof vnode.props[handlerName] === 'function') {
    return vnode.props[handlerName] as T;
  }

  return null;
}

export function getVNodeStyle(vnode: VNode) {
  return vnode.props.style as CSSProperties;
}
