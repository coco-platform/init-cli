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
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const request = require('superagent');
const ora = require('ora');
const inquirer = require('inquirer');
const git = require('download-git-repo');
const chalk = require('chalk');
const shell = require('shelljs');
const questions = require('./questions');

/**
 * @description - checkout target directory write safe
 *
 * @param {string} location
 *
 * @return {Promise<boolean>}
 */
function check(location) {
  return fse.pathExists(location).then((status) => {
    if (status) {
      throw new Error(`the location ${location} already exist.`);
    }
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
 * @typedef {object} Answers
 *
 * @property {string} provider
 * @property {string} scope
 * @property {string} repo
 * @property {string} package
 * @property {string} author
 * @property {string} email
 *
 */

/**
 * @description - render repo meta information
 *
 * @param {string} destiny
 * @param {string} template - override README.md key information
 */
async function render(destiny, template) {
  /**
   * @type {Answers}
   */
  const answers = await inquirer.prompt(questions);
  const target = path.resolve(destiny, 'package.json');
  const md = path.resolve(destiny, 'README.md');
  // override package.json
  const rawMeta = await fse.readJSON(target);
  const override = {
    name: answers.package,
    author: `${answers.author} <${answers.email}>`,
    repository: {
      type: 'git',
      url: `git+https://${answers.provider}/${answers.scope}/${
        answers.repo
      }.git`,
    },
    bugs: {
      url: `https://${answers.provider}/${answers.scope}/${
        answers.repo
      }/issues`,
    },
    homepage: `https://${answers.provider}/${answers.scope}/${
      answers.repo
    }#README`,
  };
  const after = Object.assign({}, rawMeta, override);

  await fse.writeJSON(target, after, { spaces: 2 });
  // override README.md
  const mdContent = fs.readFileSync(md, { encoding: 'utf8' });
  const nextMdContent = mdContent
    .replace(`# ${template}`, `# ${answers.package}`)
    .replace(
      new RegExp(`coco-template\\/${template}`, 'g'),
      `${answers.scope}/${answers.repo}`
    );

  fs.writeFileSync(md, nextMdContent);
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
