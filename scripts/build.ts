import shell = require('shelljs');
import chalk = require('chalk');
import path = require('path');
import fs = require('fs');

const cwd = process.cwd();

shell.cd('packages');

shell.ls().forEach((name) => {
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
