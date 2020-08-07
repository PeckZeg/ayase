import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath';
import path from 'path';
import fs from 'fs';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// prettier-ignore
const ownDirectory = fs.realpathSync(path.join(__dirname, '../..'));
const resolveOwn = (relative: string) => path.resolve(ownDirectory, relative);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  undefined,
  process.env.PUBLIC_URL
);

console.log(fs.realpathSync(path.join(__dirname, '../..')));

export const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
  'vue'
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn: typeof resolveApp, filePath: string) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

export default {
  // dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('site'),
  appPublic: resolveOwn('template/public'),
  appHtml: resolveOwn('template/public/index.html'),
  appIndexJs: resolveModule(resolveOwn, 'template/src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveOwn('template/src'),
  appExamples: resolveApp('examples'),
  appComponent: resolveApp('src'),
  appTsConfig: resolveOwn('template/tsconfig.json'),
  // appJsConfig: resolveApp('.storybook/jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  // testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  // proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath
};
