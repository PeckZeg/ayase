import { Configuration } from 'webpack-dev-server';

import noopServiceWorkerMiddleware from 'react-dev-utils/noopServiceWorkerMiddleware';
import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware';
import redirectServedPath from 'react-dev-utils/redirectServedPathMiddleware';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import paths from './paths';

export default function createDevServerConfig(): Configuration {
  return {
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    contentBasePublicPath: paths.publicUrlOrPath,
    watchContentBase: true,
    publicPath: paths.publicUrlOrPath.slice(0, -1),
    quiet: true,
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath
    },

    before(app, server) {
      // Keep `evalSourceMapMiddleware` and `errorOverlayMiddleware`
      // middlewares before `redirectServedPath` otherwise will not have any effect
      // This lets us fetch source contents from webpack for the error overlay
      app.use(evalSourceMapMiddleware(server));

      // This lets us open files from the runtime error overlay.
      app.use(errorOverlayMiddleware());
    },

    after(app) {
      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
      app.use(redirectServedPath(paths.publicUrlOrPath));

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
      app.use(noopServiceWorkerMiddleware(paths.publicUrlOrPath));
    }
  };
}
