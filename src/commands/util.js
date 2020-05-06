const chalk = require('chalk');

function transformToStr(t) {
  return chalk`{green ${t.val}}${t.desc ? chalk` {gray ${t.desc}}` : ''}`;
}

function exprLookup(exprs, key) {
  if (exprs[key]) {
    return exprs[key];
  }
  // maybe key is an id
  const res = Object.values(exprs).filter((e) => `${e.id}` === key);
  if (res.length === 1) {
    return res[0];
  }

  return null;
}

module.exports = { transformToStr, exprLookup };
