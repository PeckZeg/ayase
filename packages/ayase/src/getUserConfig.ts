import { getExistsFile } from './utils';
import { IBundleOptions } from './types';

export const CONFIG_FILES = [
  '.ayaserc.js',
  '.ayaserc.jsx',
  '.ayaserc.ts',
  '.ayaserc.tsx'
];

interface IGetUserConfig {
  cwd: string;
}

function testDefault(obj: any) {
  return obj.default || obj;
}

export default function getUserConfig({ cwd }: IGetUserConfig) {
  const configFile = getExistsFile({
    cwd,
    files: CONFIG_FILES,
    returnRelative: false
  });

  // TODO: test schema
  if (configFile) {
    const userConfig: IBundleOptions = testDefault(require(configFile));
    return userConfig;
  }

  return {} as IBundleOptions;
}
