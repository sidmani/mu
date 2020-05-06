const chalk = require('chalk');
const { transformToStr } = require('./util');

module.exports = {
  name: 'list',
  params: [],
  handle(exprs) {
    Object.values(exprs).forEach((e) => {
      const latest = e.transforms[e.transforms.length - 1];
      process.stdout.write(chalk`{gray [${e.id}]} {blue ${e.name}} ${transformToStr(latest)}\n`);
    });
  },
};
