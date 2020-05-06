module.exports = {
  name: 'delete all',
  params: [],
  handle(exprs) {
    Object.keys(exprs).forEach((k) => {
      delete exprs[k];
    });
    return { focused: null };
  },
};
