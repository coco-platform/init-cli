/**
 * @description - render dynamic content
 * @author - huang.jian <hjj491229492@hotmail.com>
 */

// packages
const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');

/**
 * @typedef {object} DynamicAnswers
 *
 * @property {string} provider
 * @property {string} scope
 * @property {string} name
 * @property {string} description
 */

/**
 *
 * @param {string} rawMeta
 * @param {DynamicAnswers} answers
 *
 * @return {string}
 */
function renderMeta(rawMeta, answers) {
  const { description, name, provider, scope } = answers;
  const meta = JSON.parse(rawMeta);
  const override = {
    name,
    description,
    repository: {
      type: 'git',
      url: `git+ssh://git@${provider}/${scope}/${name}.git`,
    },
    bugs: {
      url: `https://${provider}/${scope}/${name}/issues`,
    },
    homepage: `https://${provider}/${scope}/${name}#README`,
  };

  return JSON.stringify({ ...meta, ...override }, null, 2);
}

/**
 *
 * @param {string} rawDocument
 * @param {DynamicAnswers} answers
 *
 * @return {string}
 */
function renderDocument(rawDocument, answers) {
  const rawHeader = fs.readFileSync(path.resolve(__dirname, 'header.hbs'), {
    encoding: 'utf8',
  });
  const header = hbs.compile(rawHeader)(answers);
  const dedicated = rawDocument
    .split('\n')
    .slice(10)
    .join('\n');

  return [header, dedicated].join('\n');
}

module.exports = {
  renderMeta,
  renderDocument,
};
