import { JSXElement } from '@babel/types';
import { NodePath } from '@babel/core';
import { PluginPass } from './types';

import { transformJSXElement } from './transformers';

export default function () {
  return {
    name: 'babel-plugin-transform-vue3-jsx',
    visitor: {
      JSXElement(path: NodePath<JSXElement>, state: PluginPass) {
        path.replaceWith(transformJSXElement(path, state));
      }
    }
  };
}
