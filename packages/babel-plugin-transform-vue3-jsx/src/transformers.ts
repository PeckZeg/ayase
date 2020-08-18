import { NodePath } from '@babel/core';
import { PluginPass } from './types';

import {
  JSXExpressionContainer,
  JSXMemberExpression,
  JSXIdentifier,
  JSXAttribute,
  Expression,
  JSXElement
} from '@babel/types';

import {
  getVueNamedImportsIdentifier,
  getVNodeProps,
  getVNodeTag,
  getVNodeChildren
} from './utils';

import { types as t } from '@babel/core';

export function transformJSXElement(
  path: NodePath<JSXElement>,
  state: PluginPass
) {
  const identifier = getVueNamedImportsIdentifier(path, state, 'createVNode');
  const tag = getVNodeTag(path, state);
  const props = getVNodeProps(path, state);
  const children = getVNodeChildren(path, state);

  return t.callExpression(identifier, [tag, props, children].filter(Boolean));
}

function transformJSXMemberExpressionObject(
  path: NodePath<JSXMemberExpression | JSXIdentifier>
) {
  if (path.isJSXMemberExpression()) {
    return transformJSXMemberExpression(path);
  }

  if (path.isJSXIdentifier()) {
    return t.identifier(path.node.name);
  }

  throw new Error(`invalid type: ${path.type}`);
}

export function transformJSXMemberExpression(
  path: NodePath<JSXMemberExpression>
) {
  return t.memberExpression(
    transformJSXMemberExpressionObject(path.get('object')),
    t.identifier(path.get('property').node.name)
  );
}

function transformJSXAttributeName(path: NodePath<JSXAttribute['name']>) {
  if (path.isJSXIdentifier()) {
    return t.identifier(path.node.name);
  }

  throw new Error(`invalid type: ${path.type}`);
}

function transformJSXAttributeValue(
  path: NodePath<JSXAttribute['value']>,
  state: PluginPass
) {
  if (path.isJSXElement()) {
    return transformJSXElement(path, state);
  }

  if (path.isStringLiteral()) {
    return path.node;
  }

  if (path.isJSXExpressionContainer()) {
    return (path as NodePath<JSXExpressionContainer>).get('expression')
      .node as Expression;
  }

  throw new Error(`invalid type: ${path.type}`);
}

export function transformJSXAttribute(
  path: NodePath<JSXAttribute>,
  state: PluginPass
) {
  return t.objectProperty(
    transformJSXAttributeName(path.get('name')),
    transformJSXAttributeValue(path.get('value'), state)
  );
}
