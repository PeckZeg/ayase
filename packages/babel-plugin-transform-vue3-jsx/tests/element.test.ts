import { transform } from '@babel/core';
import path = require('path');

function transformCode(code) {
  return transform(code, {
    babelrc: false,
    plugins: [
      require.resolve('@babel/plugin-syntax-jsx'),
      require.resolve(path.join(__dirname, '../src'))
    ]
  }).code;
}

describe('element transform', () => {
  // it('<div />', () => {
  //   console.log('<div />');
  //   console.log(transformCode('<div />'));
  // });

  // it('<Component />', () => {
  //   console.log('<Component />', '\n\n', transformCode(`<Component />`));
  // });

  it('import Component from "@/component";\n<Component />', () => {
    console.log(
      'import Component from "@/component";\n<Component />',
      '\n\n',
      transformCode('import Component from "@/component";\n<Component />')
    );
  });
});
