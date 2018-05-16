/**
 * @description - node-lib-starter
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

/**
 * @description - just example
 *
 * @return {number}
 */
module.exports = function sum(...variables) {
  const numbers = Array.from(variables);

  return numbers.reduce((acc, curr) => acc + curr, 0);
};
