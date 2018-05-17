/**
 * @description - implement core tools
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// external
const chalk = require('chalk');

/* eslint-disable no-console */
function handlePromiseRejection(error) {
  console.log();
  console.log(` ${chalk.cyan('coco-cli:')} ${chalk.red(error.message)}`);
  console.log();
}
/* eslint-enable no-console */

module.exports = {
  handlePromiseRejection,
};
