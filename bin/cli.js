#!/usr/bin/env node

// packages
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const { welcome } = require('@coco-platform/tools');
const lifecycle = require('../lib/lifecycle');
const { version } = require('../package.json');

/* eslint-disable no-console */
program
  .version(version)
  .arguments('<project>')
  .option('-g, --no-proxy', 'ignore *-proxy environment variables')
  .option('-i, --no-install', 'skip package install step')
  .action(async (project) => {
    try {
      console.log(program.proxy);
      const destiny = path.resolve(process.cwd(), project);

      welcome(true);

      await lifecycle.check(destiny);

      // download repo
      const template = await lifecycle.choose(program.proxy);

      await lifecycle.download(template, destiny);
      await lifecycle.render(destiny);

      // post operatation
      if (program.install) {
        lifecycle.setup(destiny);
      }

      lifecycle.success();
    } catch (err) {
      console.log();
      console.log(` ${chalk.cyan('coco-cli:')} ${chalk.red(err)}`);
      console.log();
    }
  });
/* eslint-enable no-console */

program.parse(process.argv);
