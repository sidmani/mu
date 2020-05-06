const view = require('./view');
const clear = require('./clear');
const focus = require('./focus');
const _new = require('./new');
const list = require('./list');
const del = require('./delete');
const delAll = require('./deleteAll');
const transform = require('./transform');

module.exports = {
  v: view,
  c: clear,
  f: focus,
  n: _new,
  l: list,
  d: del,
  D: delAll,
  t: transform,
};
