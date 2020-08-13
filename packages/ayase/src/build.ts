import { BuildOpts, IBundleOptions, ICjs, IEsm } from './types';

import getUserConfig, { CONFIG_FILES } from './getUserConfig';
import { getExistsFile, log } from './utils';
import registerBabel from './registerBabel';
import babel from './babel';
import chalk from 'chalk';
import _ from 'lodash';

export function getBundleOpts(opts: BuildOpts) {
  const { cwd } = opts;
  const entry = getExistsFile({
    cwd,
    files: ['src/index.tsx', 'src/index.d.ts', 'src/index.jsx', 'src/index.js'],
    returnRelative: true
  });

  const userConfig = getUserConfig({ cwd });
  const userConfigs = Array.isArray(userConfig) ? userConfig : [userConfig];

  return (userConfigs as IBundleOptions[]).map((userConfig) => {
    const bundleOpts: IBundleOptions = _.merge({ entry }, userConfig);

    if (typeof bundleOpts.esm === 'string') {
      bundleOpts.esm = { type: bundleOpts.esm };
    }

    if (typeof bundleOpts.cjs === 'string') {
      bundleOpts.cjs = { type: bundleOpts.cjs };
    }

    return bundleOpts;
  });
}

export default async function build(opts: BuildOpts) {
  const { cwd } = opts;

  registerBabel({ cwd, only: CONFIG_FILES });

  for (const bundleOpts of getBundleOpts(opts)) {
    if (bundleOpts.cjs) {
      const cjs = bundleOpts.cjs as ICjs;

      log(`Build cjs with ${chalk.underline(cjs.type)}`);

      if (cjs.type === 'babel') {
        await babel({ type: 'cjs', cwd, log });
      }
    }

    if (bundleOpts.esm) {
      const esm = bundleOpts.esm as IEsm;
      const importLibToEs = esm && esm.importLibToEs;

      log(`Build esm with ${chalk.underline(esm.type)}`);

      if (esm.type === 'babel') {
        await babel({ type: 'esm', cwd, log, importLibToEs });
      }
    }
  }
}
