import yParser = require('yargs-parser');
import shell = require('shelljs');
import chalk = require('chalk');
import path = require('path');
import fs = require('fs');

const args = yParser(process.argv.slice(2));
const cwd = process.cwd();

shell.cd('packages');

shell.ls().forEach((name) => {
  if (args._.length && !args._.includes(name)) {
    return;
  }

  const dirname = path.join(cwd, 'packages', name);
  const pkgJsonPath = path.join(dirname, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    return;
  }

  const pkgJson = require(pkgJsonPath);

  if (!('build' in pkgJson.scripts)) {
    return;
  }

  shell.echo('🥺 ', chalk.cyan('compile package '), chalk.gray(pkgJson.name));
  shell.exec('yarn build', { cwd: dirname });
});
