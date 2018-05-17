/**
 * @description - transform user prompt with rules
 * @author - yang.yuncai <yangyuncai@outlook.com>
 */

const camelCase = require('camelcase');

const fallback = (input) => input;
const transformCamelCase = (input) => camelCase(input);
const transformPascalCase = (input) => camelCase(input, { pascalCase: true });

module.exports = {
  Fallback: fallback,
  Camel: transformCamelCase,
  Pascal: transformPascalCase,
};
