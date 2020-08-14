module.exports = function ({ types }) {
  console.log(types);
  return {
    name: 'babel-plugin-transform-vue3-jsx',
    visitor: {
      JSXElement(path, state) {
        console.log('path', path);
      }
    }
  };
};
