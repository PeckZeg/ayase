// Do this as the first thing so that any code reading it knows the right env.
import chalk from 'chalk';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

import { Stats } from 'webpack';

import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import configFactory from './config/webpack.config';
import paths from './config/paths';
import webpack from 'webpack';
import fs from 'fs-extra';

// Generate configuration
const config = configFactory('production');

Promise.resolve()
  .then(() => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild);

    // Merge with the public folder
    copyPublicFolder();

    // Start the webpack build
    return build();
  })
  .then(({ stats, warnings }) => {
    if (warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(warnings.join('\n\n'));
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
      console.log(
        'To ignore, add ' +
          chalk.cyan('// eslint-disable-next-line') +
          ' to the line before.\n'
      );
    } else {
      console.log(chalk.green('Compiled successfully.\n'));
    }
  })
  .catch((err) => {
    if (err && err.message) {
      // eslint-disable-next-line no-console
      console.log(err.message);
    }

    process.exit(1);
  });

// Create the production build and print the deployment instructions.
function build() {
  console.log('Creating an optimized production build...');

  const compiler = webpack(config);

  return new Promise<{ stats: Stats; warnings: string[] }>(
    (resolve, reject) => {
      compiler.run((err, stats) => {
        let messages: ReturnType<typeof formatWebpackMessages>;

        if (err) {
          if (!err.message) {
            return reject(err);
          }

          messages = formatWebpackMessages({
            errors: [err.message],
            warnings: []
          } as Stats.ToJsonOutput);
        } else {
          messages = formatWebpackMessages(
            stats.toJson({ all: false, warnings: true, errors: true })
          );
        }

        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1;
          }

          return reject(new Error(messages.errors.join('\n\n')));
        }

        resolve({ stats, warnings: messages.warnings });
      });
    }
  );
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml
  });
}
