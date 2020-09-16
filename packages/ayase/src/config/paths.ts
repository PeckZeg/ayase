import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath';
import path from 'path';

const appDirectory = process.cwd();
const ownDirectory = path.join(__dirname, '../../template');

const resolveApp = (relative: string) => path.resolve(appDirectory, relative);
const resolveOwn = (relative: string) => path.resolve(ownDirectory, relative);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

export const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'vue',
  'json',
  'web.jsx',
  'jsx'
];

export default {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('docs'),
  appPublic: resolveOwn('public'),
  appHtml: resolveOwn('public/index.html'),
  appIndexJs: resolveOwn('src/index.ts'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveOwn('src'),
  appTsConfig: resolveOwn('tsconfig.json'),

  appComponent: resolveApp('src'),
  appExamples: resolveApp('examples'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath
};
