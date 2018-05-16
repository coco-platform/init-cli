/**
 * @description - lint-staged configuration
 * @author - huang.jian <hjj491229492@hotmail.com>
 */
'use strict';

module.exports = {
  'src/**/*.js': [
    'lint:source',
    'git add'
  ],
  '__tests__/**/*.js': [
    'lint:test',
    'git add'
  ],
  // Temporary match rule only for working directory
  '*.config.js': [
    'eslint --fix',
    'git add'
  ]
};