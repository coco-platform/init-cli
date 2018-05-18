/**
 * @description - implement core tools
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// external
const chalk = require('chalk');
const glob = require('glob');
const _ = require('lodash');

/**
 * @description - find target templates with defined pattern
 *
 * @param {Array.<string>} patterns
 * @param {string} project - project root directory
 *
 * @return {Array.string}
 */
function explorePatternFiles(patterns, project) {
  const options = {
    cwd: project,
    root: project,
  };
  const files = patterns.map(
    (pattern) =>
      glob.hasMagic(pattern) ? glob.sync(pattern, options) : pattern
  );

  return _.flatten(files);
}

/* eslint-disable no-console */
function handlePromiseRejection(error) {
  console.log();
  console.log(` ${chalk.cyan('coco-cli:')} ${chalk.red(error.message)}`);
  console.log();
}
/* eslint-enable no-console */

module.exports = {
  explorePatternFiles,
  handlePromiseRejection,
};
