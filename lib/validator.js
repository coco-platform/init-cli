/**
 * @description - validate user prompt with rules
 * @author - yang.yuncai <hjj491229492@hotmail.com>
 */

// external
const packageNameValidator = require('validate-npm-package-name');
const packageEmailValidator = require('email-validator');
// scope
const authorRegExp = /^[a-z]{3,8}\.?[a-z]{3,20}$/;
const scopeRegExp = /^[\w-]+$/;
const pluginRegExp = /^[\w-]+$/;

function packageAlias(input) {
  return (
    packageNameValidator(input).validForNewPackages ||
    'Invalid package name, see https://docs.npmjs.com/files/package.json for details'
  );
}

function scope(input) {
  return (
    scopeRegExp.test(input) || 'Invalid package scope, only [A-Za-z_-] accepted'
  );
}

function plugin(input) {
  return (
    pluginRegExp.test(input) || 'Invalid plugin name, only [A-Za-z_-] accepted'
  );
}

function email(input) {
  return packageEmailValidator.validate(input);
}

function author(input) {
  const valid = authorRegExp.test(input);

  return valid || 'Invalid author name, following the pattern link git.hub';
}

function fallback() {
  return true;
}

module.exports = {
  scope,
  package: packageAlias,
  plugin,
  author,
  email,
  fallback,
};
