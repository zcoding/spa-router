import babel from 'rollup-plugin-babel';

export default {
  entry: 'es2015/main.js',
  format: 'cjs',
  dest: 'dist/cjs/spa-router.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
};
