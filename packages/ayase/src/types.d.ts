export type BundleType = 'babel';

interface IBundleTypeOutput {
  type: BundleType;
}

export interface ICjs extends IBundleTypeOutput {
  // TODO
  // minify?: boolean;
  // lazy?: boolean;
}

export interface IEsm extends IBundleTypeOutput {
  // TODO
  // mjs?: boolean;
  // minify?: boolean;
  importLibToEs?: boolean;
}

export interface BuildOpts {
  cwd: string;
}

export interface IBundleOptions {
  target?: 'node' | 'browser';
  entry?: string | string[];
  esm?: BundleType | IEsm | false;
  cjs?: BundleType | ICjs | false;
  runtimeHelpers?: boolean;
}
