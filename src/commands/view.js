const { transformToStr, exprLookup } = require('./util');

module.exports = {
  name: 'view',
  params: [{ name: 'name', optional: true, type: 'id' }],
  handle(exprs, focused, name) {
    const id = name || focused;

    if (!id) {
      throw new Error('no name provided or inferred');
    }

    const expr = exprLookup(exprs, name);
    if (!expr) {
      throw new Error(`${name} does not exist`);
    }

    const ts = expr.transforms;
    for (let i = 0; i < ts.length; i += 1) {
      process.stdout.write(`${transformToStr(ts[i])}\n`);
    }
  },
};
