#!/usr/bin/env node

// external
const program = require('commander');
const { welcome } = require('@coco-platform/tools');
// internal
const packager = require('../package.json');
const InitCore = require('../lib');
const { handlePromiseRejection } = require('../lib/tool');

// variables
program
  .version(packager.version)
  .arguments('<project> <template>')
  .option('-k, --no-npm', 'skip install node package')
  .option('-g, --no-git', 'skip git init operation')
  .option('-w, --no-welcome', 'skip output usage info')
  .action(async (project, template) => {
    const options = {
      project,
      template,
    };
    const core = new InitCore(options);
    const showWelcome = program.welcome;

    try {
      await welcome(showWelcome);
      await core.request();
      await core.render();
      await core.initGit();
    } catch (err) {
      handlePromiseRejection(err);
    }
  });

program.parse(process.argv);
