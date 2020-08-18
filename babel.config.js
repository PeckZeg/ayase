module.exports = {
  presets: [
    require.resolve('@babel/preset-typescript'),
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],

  plugins: [require('@ant-design-vue/babel-plugin-jsx')]
};
