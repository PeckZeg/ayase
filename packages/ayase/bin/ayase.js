#!/usr/bin/env node

const yParser = require('yargs-parser');
const chalk = require('chalk');

const args = yParser(process.argv.slice(2));

if (args.v || args.version) {
  console.log(require('../package').version);
  process.exit(0);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

const cwd = process.cwd();

switch (args._[0]) {
  case 'start': {
    require('../lib/start.js');
    break;
  }

  case 'build': {
    require('../lib/build.js').default({ cwd });
    break;
  }

  default: {
    console.error(chalk.red(`Unsupported command ${args._[0]}`));
    process.exit(1);
  }
}
