import getBabelConfig from './getBabelConfig';

import path from 'path';

interface IRegisterBabelOpts {
  cwd: string;
  only: string[];
}

export default function registerBabel({ cwd, only }: IRegisterBabelOpts) {
  const [babelConfig] = getBabelConfig({
    target: 'node',
    typescript: true
  });

  require('@babel/register')({
    ...babelConfig,
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    only: only.map((file) => path.join(cwd, file)),
    babelrc: false,
    cache: false
  });
}
