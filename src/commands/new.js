const { transformToStr } = require('./util');

let idx = 0;

module.exports = {
  name: 'new',
  params: [{ name: 'name' }, { name: 'value', optional: true }],
  handle(exprs, focused, name, value) {
    if (exprs[name]) {
      throw new Error(`${name} is already in use`);
    }

    if (!value) {
      value = name;
    }

    const t = { desc: 'initial', val: value };
    exprs[name] = {
      name,
      transforms: [t],
      id: ++idx,
    };
    process.stdout.write(`${transformToStr(t)}\n`);
    return { focused: name };
  },
};
