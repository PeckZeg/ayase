import { JSXElement } from '@babel/types';
import { NodePath } from '@babel/core';
import { PluginPass } from './types';

import { getVNodeTag, getVueNamedImportsIdentifier } from './utils';
import { types as t } from '@babel/core';

export function transformJSXElement(
  path: NodePath<JSXElement>,
  state: PluginPass
) {
  const identifier = getVueNamedImportsIdentifier(path, state, 'createVNode');
  const tag = getVNodeTag(path, state);

  return t.callExpression(identifier, [tag]);
}
