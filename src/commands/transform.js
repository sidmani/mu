const { transformToStr } = require('./util');

module.exports = {
  name: 'transform',
  params: [
    { name: 'value' },
    { name: 'description', type: 'str', optional: true },
  ],
  handle(exprs, focused, val, desc) {
    if (!focused) {
      throw new Error('no expr to transform');
    }

    const t = { desc, val };
    exprs[focused].transforms.push(t);
    process.stdout.write(`${transformToStr(t)}\n`);
  },
};
