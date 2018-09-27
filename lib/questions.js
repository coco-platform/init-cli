/**
 * @description - collect information to render template
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// packages
const email = require('email-validator');
const packager = require('validate-npm-package-name');
// scope
const scopeRegExp = /^[\w-]+$/;
const authorRegExp = /^[a-z]{3,8}\.?[a-z]{3,20}$/;

const questions = [
  {
    type: 'list',
    name: 'provider',
    message: `what's the git cloud provider`,
    choices: ['github.com', 'gitlab.com', 'bitbucket.org'],
    default: 'github.com',
  },
  {
    type: 'input',
    name: 'scope',
    message: `what's the account name`,
    validate(input) {
      return (
        scopeRegExp.test(input) ||
        'Invalid package scope, only [A-Za-z_-] accepted'
      );
    },
  },
  {
    type: 'input',
    name: 'repo',
    message: `what's the repo name`,
    validate(input) {
      return (
        scopeRegExp.test(input) ||
        'Invalid package scope, only [A-Za-z_-] accepted'
      );
    },
  },
  {
    type: 'input',
    name: 'package',
    message: `what's the package name`,
    validate(input) {
      return (
        packager(input).validForNewPackages ||
        'Invalid package name, see https://docs.npmjs.com/files/package.json for details'
      );
    },
  },
  {
    type: 'input',
    name: 'author',
    message: `what's the author name`,
    validate(input) {
      return (
        authorRegExp.test(input) ||
        'Invalid author name, following the pattern link git.hub'
      );
    },
  },
  {
    type: 'input',
    name: 'email',
    message: `what's the author email`,
    validate(input) {
      return (
        email.validate(input) || 'Invalid email pattern, please check again'
      );
    },
  },
];

module.exports = questions;
