const readline = require('readline');
const chalk = require('chalk');
const { exprLookup } = require('./commands/util');
const commands = require('./commands');
const transform = require('./transform');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const exprs = {};
let current;

function updatePrompt() {
  rl.setPrompt(chalk`{hex('#FF7777') μ}${current ? chalk`{grey @}{blue ${current}}` : ''} `);
}
updatePrompt();

rl.prompt();
rl.on('line', (input) => {
  try {
    const data = input
      .match(/(?:[^\s']+|'[^']*')+/g)
      .map((p) => transform(p));

    // consecutive commands
    let cs;
    if (data[0].length > 0) {
      cs = data[0].split('');
    } else {
      cs = [data[0]];
    }

    for (let i = 0; i < cs.length; i += 1) {
      const command = cs[i];
      const c = commands[command];

      if (!c) {
        throw new Error(`unknown command ${command}`);
      }

      let minParams = 0;
      for (; minParams < c.params.length; minParams += 1) {
        if (c.params[minParams].optional) {
          break;
        }
      }


      if (data.length - 1 < minParams) {
        throw new Error(`expected at least ${minParams} parameters, received ${data.length - 1}`);
      }

      if (data.length - 1 > c.params.length) {
        throw new Error(`expected at most ${c.params.length} parameters, received ${data.length - 1}`);
      }

      const result = c.handle(exprs, current, ...data.slice(1));
      if (result) {
        current = result.focused;
      }
    }
  } catch (e) {
    process.stdout.write(chalk`{red E! ${e.message}}\n`);
  }

  updatePrompt();
  rl.prompt();
});
