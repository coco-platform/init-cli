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
  .option(
    '-r, --registry <registry>',
    'specific npm registry',
    /^https?:\/\/[a-z.]+\/?$/,
    'https://registry.npmjs.org/'
  )
  .option('-s, --no-install', 'skip install node package')
  .option('-g, --no-git', 'skip git init operation')
  .action(async (project) => {
    try {
      const destiny = path.resolve(process.cwd(), project);

      await welcome(true);
      await lifecycle.check(destiny);
      const template = await lifecycle.choose();
      await lifecycle.download(template, destiny);
      await lifecycle.render(destiny);
      await lifecycle.setup(destiny);
      await lifecycle.success();
    } catch (err) {
      console.log();
      console.log(` ${chalk.cyan('coco-cli:')} ${chalk.red(err)}`);
      console.log();
    }
  });
/* eslint-enable no-console */

program.parse(process.argv);
