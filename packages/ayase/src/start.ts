// Do this as the first thing so that any code reading it knows the right env.
import chalk from 'chalk';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

import { Urls } from 'react-dev-utils/WebpackDevServerUtils';
import WebpackDevServer from 'webpack-dev-server';

import clearConsole from 'react-dev-utils/clearConsole';
import openBrowser from 'react-dev-utils/openBrowser';
import configFactory from './config/webpack.config';
import paths from './config/paths';
import webpack from 'webpack';

import {
  createCompiler,
  choosePort,
  prepareUrls
} from 'react-dev-utils/WebpackDevServerUtils';
import createDevServerConfig from './config/webpackDevServer.config';

const useYarn = true;
const isInteractive = process.stdout.isTTY;

const DEFAULT_PORT = 3000;
const HOST = '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const config = configFactory('development');
    const protocol = 'http';
    const appName = require(paths.appPackageJson).name;
    const useTypeScript = true;
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

    const urls: Urls = (prepareUrls as any)(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );

    const devSocket = {
      warnings: (warnings) =>
        devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: (errors) => {
        console.log('errors', errors);
        devServer.sockWrite(devServer.sockets, 'errors', errors);
      }
    };

    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName,
      config,
      devSocket,
      urls,
      useYarn,
      useTypeScript: false,
      tscCompileOnError,
      webpack
    } as any);

    const serverConfig = createDevServerConfig();

    const devServer = new WebpackDevServer(compiler, serverConfig);

    // Launch WebpackDevServer.
    devServer.listen(port, HOST, (err) => {
      if (err) {
        return console.log(err);
      }

      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
