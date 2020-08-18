import { addNamed } from '@babel/helper-module-imports';
import { NodePath, Node } from '@babel/core';
import { PluginPass } from './types';

import {
  JSXExpressionContainer,
  JSXSpreadAttribute,
  JSXElement,
  Identifier
} from '@babel/types';

import cleanJSXElementLiteralChild from '@babel/types/lib/utils/react/cleanJSXElementLiteralChild';
import { types as t } from '@babel/core';
import htmlTags from 'html-tags';

import {
  transformJSXMemberExpression,
  transformJSXAttribute,
  transformJSXElement
} from './transformers';

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

  // example: <List.Item.Meta />
  if (element.isJSXMemberExpression()) {
    return transformJSXMemberExpression(element);
  }

  throw new Error(`invalid type: ${element.type}`);
}

export function getVNodeProps(path: NodePath<JSXElement>, state: PluginPass) {
  const attributes = path.get('openingElement').get('attributes');

  if (!attributes.length) {
    return false as const;
  }

  return t.objectExpression(
    attributes.map((attribute) => {
      if (attribute.isJSXAttribute()) {
        return transformJSXAttribute(attribute, state);
      }

      if (attribute.isJSXSpreadAttribute()) {
        return t.spreadElement(
          (attribute as NodePath<JSXSpreadAttribute>).get('argument').node
        );
      }
    })
  );
}

export function getVNodeChildren(
  path: NodePath<JSXElement>,
  state: PluginPass
) {
  const children = path.get('children');

  if (!children.length) {
    return false as const;
  }

  const elements = [];

  for (const child of children) {
    if (child.isJSXText()) {
      cleanJSXElementLiteralChild(child.node, elements);
      continue;
    }

    if (child.isJSXExpressionContainer(child)) {
      const expression = (child as NodePath<JSXExpressionContainer>).get(
        'expression'
      );

      if (expression.isJSXEmptyExpression()) {
        continue;
      }

      elements.push(expression.node);
      continue;
    }

    if (child.isJSXElement()) {
      elements.push(transformJSXElement(child, state));
      continue;
    }

    elements.push(child);
  }

  if (!elements.length) {
    return false as const;
  }

  return t.arrayExpression(elements);
}
