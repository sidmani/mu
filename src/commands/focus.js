module.exports = {
  name: 'focus',
  params: [{ name: 'name' }],
  handle(exprs, focused, name) {
    if (exprs[name]) {
      return { focused: name };
    }

    const res = Object.keys(exprs).filter((k) => `${exprs[k].id}` === name);
    if (res.length === 1) {
      return { focused: res[0] };
    }

    throw new Error(`${name} does not exist`);
  },
};
