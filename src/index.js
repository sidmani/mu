const readline = require('readline');
const chalk = require('chalk');
const replace = require('./replace');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const mu_color = '#FF7777';
rl.setPrompt(chalk`{hex('${mu_color}') μ }`);

let exprs = {};
let current;
let idx = 0;

function transformToStr(t) {
  return chalk`{green ${t.val}}${t.desc ? chalk` {gray ${t.desc}}` : ''}`;
}

function exprLookup(key) {
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

const commands = {
  c: {
    name: 'clear',
    params: [],
    handle() {
      current = undefined;
    }
  },
  f: {
    name: 'focus',
    params: [{ name: 'name' }],
    handle(name) {
      if (!exprs[name]) {
        throw new Error(`${name} does not exist`);
      }

      current = name;
    }
  },
  t: {
    name: 'transform',
    params: [
      { name: 'value' },
      { name: 'description', type: 'str', optional: true },
    ],
    handle(val, desc) {
      if (!current) {
        throw new Error('no expr to transform')
      }

      const t = { desc, val };
      exprs[current].transforms.push(t);
      process.stdout.write(`${transformToStr(t)}\n`);
    },
  },
  n: {
    name: 'new',
    params: [{ name: 'name' }, { name: 'value' }],
    handle(name, value) {
      if (exprs[name]) {
        throw new Error(`${name} is already in use`);
      }

      if (!value) {
        throw new Error('no initial value provided');
      }

      const t = { desc: 'initial', val: value };
      exprs[name] = {
        name,
        transforms: [t],
        id: ++idx,
      };
      current = name;
      process.stdout.write(`${transformToStr(t)}\n`);
    },
  },
  v: {
    name: 'view',
    params: [{ name: 'name', optional: true }],
    handle(name) {
      if (!name && current) {
        name = current;
      }

      if (!name) {
        throw new Error('no name provided or inferred');
      }

      const expr = exprLookup(name);
      if (!expr) {
        throw new Error(`${name} does not exist`);
      }

      const ts = expr.transforms;
      for (let i = 0; i < ts.length; i += 1) {
        process.stdout.write(`${transformToStr(ts[i])}\n`);
      }
    }
  },
  l: {
    name: 'list',
    params: [],
    handle() {
      Object.values(exprs).forEach((e) => {
        const latest = e.transforms[e.transforms.length - 1];
        process.stdout.write(chalk`{gray [${e.id}]} {blue ${e.name}} ${transformToStr(latest)}\n`);
      });
    },
  },
  d: {
    name: 'delete',
    params: [{ name: 'name', optional: true }],
    handle(name) {
      if (!name) {
        name = current;
      }

      if (!exprs[name]) {
        throw new Error(`${name} does not exist`);
      }

      delete exprs[name];
      if (current === name) {
        current = undefined;
      }
    },
  },
  D: {
    name: 'delete all',
    params: [],
    handle() {
      exprs = {};
      current = undefined;
    },
  },
};

rl.prompt();
rl.on('line', (input) => {
  try {
    const data = input
      .match(/(?:[^\s']+|'[^']*')+/g)
      .map((p) => {
        // replace macros (start with \)
        p = p.replace(/\\([a-zA-Z]+) ?/g, (_, m) => {
          if (replace[m]) {
            return replace[m].value;
          }
          throw new Error(`unknown macro ${m}`);
        })

        // replace substitutions (start with $)
        p = p.replace(/\$(?:([a-zA-Z0-9]+) ?|{([^}]+)})/g, (_, m, m2) => {
          const name = m || m2;
          const expr = exprLookup(name);
          if (!expr) {
            throw new Error(`${name} does not exist`);
          }

          return expr.transforms[expr.transforms.length - 1].val;
        })

        // replace numerical superscripts
        // p = p.replace(/\^([0-9]+)/g, (_, m))

        if (p.slice(0, 1) === "'" && p.slice(-1) === "'") {
          p = p.slice(1, -1);
        }
        return p;
      });

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
        for (; minParams < c.params.length; minParams++) {
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

        const result = c.handle(...data.slice(1));
    }
  } catch (e) {
    process.stdout.write(chalk`{red E! ${e.message}}\n`);
  }

  rl.setPrompt(chalk`{hex('${mu_color}') μ}${current ? chalk`{grey @}{blue ${current}}` : ''} `);
  rl.prompt();
});
