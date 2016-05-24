import babel from 'rollup-plugin-babel';

export default {
  entry: 'es2015/main.js',
  format: 'iife',
  dest: 'dist/iife/spa-router.js',
  sourceMap: true,
  moduleName: 'spaRouter',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
};
