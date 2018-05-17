/**
 * @description - implement core feature
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

/**
 * @typedef {object} Options
 *
 * @property {string} project - init project name
 * @property {string} template - available template name
 */

/* eslint-disable no-use-before-define */

// native
const path = require('path');
const fs = require('fs');

// external
const ora = require('ora');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const YAML = require('yamljs');
const handlebars = require('handlebars');
const shell = require('shelljs');
// internal
const validator = require('./validator');
const transformer = require('./transformer');

// scope
const spinner = ora('coco refresh template: ');

class InitCore {
  /**
   * @param {Options}  options
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @private
   *
   * @returns {Promise}
   */
  checkDestinyExist() {
    const destination = path.resolve(process.cwd(), this.options.project);
    const isDestinationExist = fs.existsSync(destination);

    if (isDestinationExist) {
      return Promise.reject(
        new Error('target directory exists, please change project name')
      );
    }

    return Promise.resolve('Consistent Return');
  }

  /**
   * @private
   * @returns {Promise<any>}
   */
  download() {
    spinner.start();

    const { project, template } = this.options;
    const seed = `coco-template/${this.options.template}-starter`;
    const destination = path.resolve(process.cwd(), project);

    return new Promise((resolve, reject) => {
      download(seed, destination, (err) => {
        spinner.stop();
        if (err) {
          reject(
            new Error(
              `Failed to download ${template}, ${err.message.trim()}, use 'coco list' to query available template`
            )
          );
        } else {
          resolve(destination);
        }
      });
    });
  }

  async request() {
    await this.checkDestinyExist();
    await this.download();
  }

  async render() {
    const { project } = this.options;
    const rootProject = path.resolve(process.cwd(), project);
    const metaFile = path.resolve(rootProject, 'coco.yml');

    // break when meta file missing
    if (!fs.existsSync(metaFile)) return;

    const { meta, templates, ignores } = YAML.load(metaFile);
    const questions = meta.map((item) =>
      Object.assign({}, item, {
        validate:
          Reflect.get(validator, item.key) ||
          Reflect.get(validator, 'fallback'),
      })
    );
    const formatHashMap = meta.reduce((acc, curr) => {
      if (curr.format) {
        return Object.assign({}, acc, {
          [curr.key]:
            Reflect.get(transformer, curr.format) ||
            Reflect.get(transformer, 'Fallback'),
        });
      }

      return acc;
    }, {});

    const answers = await inquirer.prompt(questions);
    const context = await Reflect.ownKeys(formatHashMap).reduce((acc, key) => {
      const transform = Reflect.get(formatHashMap, key);
      const rawValue = Reflect.get(acc, key);
      const value = transform(rawValue);

      return Object.assign({}, acc, { [key]: value });
    }, answers);

    templates.forEach((template) => {
      const hbs = path.resolve(rootProject, `${template}.hbs`);
      const destiny = path.resolve(rootProject, template);
      const content = fs.readFileSync(hbs, { encoding: 'utf8' });
      const output = handlebars.compile(content)(context);

      fs.writeFileSync(destiny, output);
      fs.unlinkSync(hbs);
    });

    ignores.forEach((ignore) => {
      fs.unlinkSync(path.resolve(rootProject, ignore));
    });
  }

  initGit() {
    const { project } = this.options;
    const rootProject = path.resolve(process.cwd(), project);

    shell.cd(rootProject);
    shell.exec('git init --quiet');
    shell.exec('git add .');
    shell.exec('git commit -m "coco-init render commit."');
  }
}

module.exports = InitCore;
