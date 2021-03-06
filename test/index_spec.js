/* global it, describe */

const { expect } = require('chai');
const S = require('../index');

describe('isList', () => {
  it('is true for lists', () => {
    const exp = [];

    expect(S.isList(exp)).to.equal(true);
  });

  it('is false for atoms, like numbers', () => {
    const exp = 0;

    expect(S.isList(exp)).to.equal(false);
  });

  it('...and false for other things that are not lists, too', () => {
    const exp = {};

    expect(S.isList(exp)).to.equal(false);
  });
});

describe('isAtom', () => {
  it('is true for numbers', () => {
    const exp = 0;

    expect(S.isAtom(exp)).to.equal(true);
  });

  it('is true for strings', () => {
    const exp = 'hello';

    expect(S.isAtom(exp)).to.equal(true);
  });

  it('is true for other things that are not lists', () => {
    const exp = {};

    expect(S.isAtom(exp)).to.equal(true);
  });

  it('is false for list', () => {
    const exp = [];

    expect(S.isAtom(exp)).to.equal(false);
  });
});

describe('isNumber', () => {
  it('is true for numbers', () => {
    const exp = 0;

    expect(S.isNumber(exp)).to.equal(true);
  });

  it('is false for NaN', () => {
    const exp = NaN;

    expect(S.isNumber(exp)).to.equal(false);
  });

  it('is false for strings', () => {
    const exp = 'hello';

    expect(S.isNumber(exp)).to.equal(false);
  });

  it('...and other things that are not numbers', () => {
    const exp = {};

    expect(S.isNumber(exp)).to.equal(false);
  });
});

describe('isNull', () => {
  it('is true for the null list', () => {
    const exp = [];

    expect(S.isNull(exp)).to.equal(true);
  });

  it('is false for non-empty list', () => {
    const exp = [[]];

    expect(S.isNull(exp)).to.equal(false);
  });

  it('does not work for atoms, like numbers', () => {
    const exp = 0;

    expect(() => S.isNull(exp)).to.throw();
  });

  it('...and other things that are not lists', () => {
    const exp = {};

    expect(() => S.isNull(exp)).to.throw();
  });
});

describe('car', () => {
  it('returns the first element of a list', () => {
    const l = [['one'], 'two'];

    expect(S.car(l)).to.eql(['one']);
  });

  it('only works on lists', () => {
    const l = 'hello';

    expect(() => S.car(l)).to.throw();
  });

  it('...that are not the empty list', () => {
    const l = [];

    expect(() => S.car(l)).to.throw();
  });
});

describe('cdr', () => {
  it('returns a new list containing all elements other than the car of a list', () => {
    const l1 = [['one'], 'two'];
    const l2 = S.cdr(l1);

    expect(l2).to.eql(['two']);
  });

  it('is a pure function', () => {
    const l1 = [['one'], 'two'];
    const l2 = S.cdr(l1);

    expect(l1).to.eql([['one'], 'two']);
  });

  it('only works on lists', () => {
    const l = 'hello';

    expect(() => S.cdr(l)).to.throw();
  });

  it('...that are not the empty list', () => {
    const l = [];

    expect(() => S.cdr(l)).to.throw();
  });
});

describe('cons', () => {
  it('returns a new list containing the first argument followed by the elements of the second argument', () => {
    const exp = [['one'], 'two'];
    const l = ['three'];
    const n = S.cons(exp, l);

    expect(n).to.eql([[['one'], 'two'], 'three']);
  });

  it('is a pure function', () => {
    const exp = [['one'], 'two'];
    const l = ['three'];
    const n = S.cons(exp, l);

    expect(l).to.eql(['three']);
  });

  it('only works if the second argument is a list', () => {
    const exp = ['world'];
    const l = 'hello';

    expect(() => S.cons(exp, l)).to.throw();
  });

  it('...and not anything else', () => {
    const exp = [['one'], 'two'];
    const l = { 3: ['three'] };

    expect(() => S.cons(exp, l)).to.throw();
  });
});

describe('jSExpression', () => {
  it('takes a string representng a valid scheme expression and turns it into an array', () => {
    const string = '(car (cdr l))';

    expect(S.jSExpression(string)).to.eql(['car', ['cdr', 'l']]);
  });

  it('is a pure function', () => {
    const string = '(car (cdr l))';
    const exp = S.jSExpression(string);

    expect(string).to.equal('(car (cdr l))');
  });

  it('returns an atom if the argument is a string representing an atom', () => {
    const string = 'hello';

    expect(S.isAtom(S.jSExpression(string))).to.equal(true);
  });

  it('...and a list if it is a string representing a list', () => {
    const string = '(hello world)';

    expect(S.isList(S.jSExpression(string))).to.equal(true);
  });

  it('returns a number, rather than a string, for any numbers in the argument', () => {
    const string = '(5 cookies)';

    expect(S.isNumber(S.car(S.jSExpression(string)))).to.equal(true);
  });

  it('surrounds a list in parentheses if none were supplied, but does not do so if they were', () => {
    const string = '(hello world)';

    expect(S.jSExpression(string)).to.eql(['hello', 'world']);
  });

  it('converts #t to Boolean true', () => {
    const string = '#t';

    expect(S.jSExpression(string)).to.equal(true);
  });

  it('converts #f to Boolean false', () => {
    const string = '#f';

    expect(S.jSExpression(string)).to.equal(false);
  });

  it('handles the null list', () => {
    const string = '()';

    expect(S.jSExpression(string)).to.eql([]);
  });

  it('handles grammatical symbols, so it can be used for sentence composition. Note #n is used for newline', () => {
    const string = '(#n \' \\ / | " , : . ... & - )';

    expect(S.jSExpression(string)).to.eql(['\n', '\'', '\\', '/', '|', '"', ',', ':', '.', '...', '&', '-']);
  });

  it('handles other special JS types', () => {
    const string = '(#null #Infinity #NaN #undefined)';

    expect(S.jSExpression(string)).to.eql([null, Infinity, NaN, undefined]);
  });
});

describe('evaluate', () => {
  it('converts special symbols back from JS to Scheme', () => {
    const input = [null, Infinity, NaN, undefined];

    expect(S.evaluate(input, true, false, true)).to.equal('( #null #Infinity #NaN #undefined )');
  });
});
