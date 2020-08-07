import { ModuleFormat } from 'rollup';

interface IGetBabelConfigOpts {
  target: 'browser' | 'node';
  type?: ModuleFormat;
  typescript?: boolean;
  runtimeHelpers?: boolean;
  filePath?: string;
  nodeVersion?: number;
  lazy?: boolean;
}

export default function getBabelConfig(opts: IGetBabelConfigOpts) {
  const { target, type, lazy, nodeVersion = 6 } = opts;
  const isBrowser = target === 'browser';

  // prettier-ignore
  const targets = (
    isBrowser ?
      { browsers: ['last 2 versions', 'IE 10'] } :
      { node: nodeVersion }
  );

  return [
    {
      presets: [
        opts.typescript && require.resolve('@babel/preset-typescript'),
        [
          require.resolve('@babel/preset-env'),
          {
            targets,
            modules: opts.type === 'esm' ? false : 'auto'
          }
        ]
      ].filter(Boolean),

      plugins: [
        type === 'cjs' &&
          lazy &&
          !isBrowser && [
            require.resolve('@babel/plugin-transform-modules-commonjs'),
            {
              lazy: true
            }
          ],
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        require.resolve('@babel/plugin-proposal-do-expressions'),
        require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
        require.resolve('@babel/plugin-proposal-optional-chaining'),
        [
          require.resolve('@babel/plugin-proposal-decorators'),
          { legacy: true }
        ],
        [
          require.resolve('@babel/plugin-proposal-class-properties'),
          { loose: true }
        ],
        opts.runtimeHelpers && [
          require.resolve('@babel/plugin-transform-runtime'),
          { useESModules: isBrowser && type === 'esm' }
        ]
      ].filter(Boolean)
    },
    isBrowser
  ] as const;
}
