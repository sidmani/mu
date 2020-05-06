module.exports = {
  name: 'delete',
  params: [{ name: 'name', optional: true }],
  handle(exprs, focused, name) {
    const id = name || focused;
    if (!id) {
      throw new Error('could not infer name');
    }

    if (!exprs[id]) {
      throw new Error(`${name} does not exist`);
    }

    delete exprs[id];
    if (focused === id) {
      return { focused: null };
    }
    return null;
  },
};
