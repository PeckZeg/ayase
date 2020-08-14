import { addNamed } from '@babel/helper-module-imports';
import { JSXElement, Identifier } from '@babel/types';
import { NodePath, Node } from '@babel/core';
import { PluginPass } from './types';

import { types as t } from '@babel/core';
import htmlTags = require('html-tags');

export function getVueNamedImportsIdentifier<T = Node, S = Identifier>(
  path: NodePath<T>,
  state: PluginPass,
  name: string
) {
  if (!state.get(name)) {
    state.set(name, addNamed(path, name, 'vue'));
  }

  return state.get<S>(name);
}

export function getVNodeTag(path: NodePath<JSXElement>, state: PluginPass) {
  const element = path.get('openingElement').get('name');

  if (element.isJSXIdentifier()) {
    if (htmlTags.includes(element.node.name)) {
      return t.stringLiteral(element.node.name);
    }

    if (element.scope.hasBinding(element.node.name)) {
      return t.identifier(element.node.name);
    }

    // https://v3.vuejs.org/api/global-api.html#resolvecomponent
    return t.callExpression(
      getVueNamedImportsIdentifier(path, state, 'resolveComponent'),
      [t.stringLiteral(element.node.name)]
    );
  }

  throw new Error(`${element.type} not supported`);
}
