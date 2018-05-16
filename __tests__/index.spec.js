/**
 * @description - main test suits
 * @author - bornkiller <hjj491229492@hotmail.com>
 */

const sum = require('../src');

describe('simple suits', () => {
  it('simple case', () => {
    expect(sum(1, 2, 3)).toEqual(6);
  });
});
