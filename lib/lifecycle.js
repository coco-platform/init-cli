/**
 * @description - coco init life cycle implement
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

/**
 * =============================================================================
 * coco init life cycle:
 *
 * 1. check;
 * 2. choose available template;
 * 3. download template;
 * 4. render related template;
 * 5. setup - install dependencies, init git;
 * 6. success info;
 * =============================================================================
 */

// packages
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const request = require('superagent');
const ora = require('ora');
const inquirer = require('inquirer');
const git = require('download-git-repo');
const chalk = require('chalk');
const shell = require('shelljs');
const renderer = require('./renderer');

// scope
const regExp = {
  scope: /^[\w-]+$/,
};

/**
 * @description - checkout target directory write safe
 *
 * @param {string} location
 *
 * @return {Promise<boolean>}
 */
function check(location) {
  return fse.pathExists(location).then((exist) => {
    assert(!exist, `the location ${location} already exist.`);
  });
}

/**
 * @description - query available template from github coco-template group
 *
 * @return {string}
 */
async function choose() {
  const spinner = ora('search template');

  spinner.start();

  const res = await request
    .get('https://api.github.com/users/coco-template/repos')
    .set('User-Agent', 'coco-cli')
    .set('Accept', 'application/json');
  const choices = res.body.map((repo) => `${repo.name} - ${repo.description}`);

  spinner.succeed();

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'which template do you need?',
      choices,
    },
  ]);
  const [repo] = template.split(' - ');

  return repo.trim();
}

/**
 * @description - download from coco-template organization
 *
 * @param {string} template
 * @param {string} destiny
 *
 * @return {Promise<void>}
 */
function download(template, destiny) {
  const spinner = ora('loading template');
  const repo = `coco-template/${template}`;

  spinner.start();

  return new Promise((resolve, reject) => {
    git(repo, destiny, {}, (err) => {
      spinner.succeed();
      if (err) {
        spinner.fail();
        reject(err);
      } else {
        spinner.succeed();
        resolve(destiny);
      }
    });
  });
}

/**
 * @description - render repo meta information
 *
 * @param {string} destiny
 */
async function render(destiny) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: `What's the git cloud provider?`,
      choices: ['github.com', 'gitlab.com', 'bitbucket.org'],
      default: 'github.com',
    },
    {
      type: 'input',
      name: 'scope',
      message: `what's the repo scope?`,
      validate(input) {
        return (
          regExp.scope.test(input) ||
          'Invalid repo scope, only [A-Za-z_-] accepted'
        );
      },
    },
    {
      type: 'input',
      name: 'name',
      message: `what's the repo name?`,
      validate(input) {
        return (
          regExp.scope.test(input) ||
          'Invalid package scope, only [A-Za-z_-] accepted'
        );
      },
    },
    {
      type: 'input',
      name: 'description',
      message: `what's the repo description?`,
    },
  ]);
  const dynamics = [
    path.resolve(destiny, 'package.json'),
    path.resolve(destiny, 'README.md'),
  ];
  const [rawMeta, rawDocument] = dynamics
    .map((filename) => path.resolve(destiny, filename))
    .map((location) => fs.readFileSync(location, { encoding: 'utf8' }));
  const meta = renderer.renderMeta(rawMeta, answers);
  const document = renderer.renderDocument(rawDocument, answers);

  fs.writeFileSync(dynamics[0], meta);
  fs.writeFileSync(dynamics[1], document);
}

/**
 * @description - init git
 *
 * @param {string} destiny
 */
function setup(destiny) {
  shell.cd(destiny);
  shell.exec('yarn install --ignore-scripts');
  shell.exec('git init --quiet');
  shell.exec('git add .');
  shell.exec('git commit -m "coco-cli initial commit."');
}

/* eslint-disable no-console */
function success() {
  console.log();
  console.log(
    `Init successful, you can run below commands in the directory: \n`
  );
  console.log(`  ${chalk.cyan('yarn run dev')}`);
  console.log(`    Start the development server.\n`);
  console.log(`  ${chalk.cyan('yarn run build')}`);
  console.log(`    Bundle the project into static files for production.\n`);
  console.log(`  ${chalk.cyan('yarn run test')}`);
  console.log(`    Ensure unit test for CI.\n`);
  console.log(`  ${chalk.cyan('yarn run deploy')}`);
  console.log(`    Deploy production read static into remote machine.\n`);
  console.log();
}

/* eslint-enable no-console */

module.exports = {
  check,
  choose,
  download,
  render,
  setup,
  success,
};
