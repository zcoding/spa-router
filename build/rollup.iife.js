import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'iife',
  dest: 'dist/iife/spa-router.js',
  sourceMap: true,
  moduleName: 'Router',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
};
