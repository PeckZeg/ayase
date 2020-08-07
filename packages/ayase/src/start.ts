import WebpackDevServer from 'webpack-dev-server';

import {
  createCompiler,
  prepareProxy,
  prepareUrls,
  choosePort
} from 'react-dev-utils/WebpackDevServerUtils';

import configFactory from './webpack/webpack.config';
import paths from './webpack/paths';
import signale from 'signale';
import { log } from './utils';
import webpack from 'webpack';
import chalk from 'chalk';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const port = await choosePort(HOST, DEFAULT_PORT);

  if (!port) {
    log(chalk.yellow('We have not found a port.'));
    return;
  }

  const config = configFactory('development');
  const appName = require(paths.appPackageJson).name;
  const urls = prepareUrls('http', HOST, port);

  const devSocket = {
    warnings: (warnings) =>
      devServer.sockWrite(devServer.sockets, 'warnings', warnings),
    errors: (errors) => devServer.sockWrite(devServer.sockets, 'errors', errors)
  };

  const compiler = createCompiler({
    appName,
    config,
    urls,
    useYarn: true,
    webpack,
    useTypeScript: false,
    devSocket
  });

  // Load proxy config
  const proxySetting = require(paths.appPackageJson).proxy;
  const proxyConfig = prepareProxy(
    proxySetting,
    paths.appPublic,
    paths.publicUrlOrPath
  );

  const devServer = new WebpackDevServer(compiler, {
    compress: true,
    contentBase: paths.appBuild,
    contentBasePublicPath: paths.publicUrlOrPath,
    publicPath: paths.publicUrlOrPath.slice(0, -1),
    host: HOST,
    port
  });

  devServer.listen(port, HOST, (err) => {
    if (err) {
      return console.log(err);
    }

    log('Starting the development server...\n');
  });

  ['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, function () {
      devServer.close();
      process.exit();
    });
  });
}

start().catch((err) => {
  if (err && err.message) {
    signale.error(err.message);
  }
  process.exit(1);
});
