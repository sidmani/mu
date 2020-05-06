const macros = require('./macro');
const { exprLookup } = require('./commands/util');

function macro(p) {
  return p.replace(/\\([a-zA-Z0-9]+)/g, (_, m) => {
    for (let i = 0; i < m.length; i += 1) {
      const slc = m.slice(0, m.length - i);
      if (macros[slc]) {
        return `${macros[slc].value}${m.slice(m.length - i, m.length)}`;
      }
    }
    throw new Error(`unknown macro ${m}`);
  });
}

function substitute(p, exprs) {
  return p.replace(/\$(?:([a-zA-Z0-9]+) ?|{([^}]+)})/g, (_, m, m2) => {
    const name = m || m2;
    const expr = exprLookup(exprs, name);
    if (!expr) {
      throw new Error(`${name} does not exist`);
    }

    return expr.transforms[expr.transforms.length - 1].val;
  });
}

const UNICODE_SUP = {
  0: '\u2070',
  1: '\u00B9',
  2: '\u00B2',
  3: '\u00B3',
  4: '\u2074',
  5: '\u2075',
  6: '\u2076',
  7: '\u2077',
  8: '\u2078',
  9: '\u2079',
};
const UNICODE_SUB = {
  0: '\u2080',
  1: '\u2081',
  2: '\u2082',
  3: '\u2083',
  4: '\u2084',
  5: '\u2085',
  6: '\u2086',
  7: '\u2087',
  8: '\u2088',
  9: '\u2089',
};

function numberScript(p) {
  return p.replace(/(\^|_)([0-9]+)/g, (_, kind, m) => {
    let n = '';
    const table = kind === '_' ? UNICODE_SUB : UNICODE_SUP;
    for (let i = 0; i < m.length; i += 1) {
      n += table[m.charAt(i)];
    }
    return n;
  });
}

module.exports = function transform(s, exprs) {
  let s2 = macro(s);
  s2 = substitute(s2, exprs);
  s2 = numberScript(s2);
  if (s2.slice(0, 1) === "'" && s2.slice(-1) === "'") {
    s2 = s2.slice(1, -1);
  }

  return s2;
};
