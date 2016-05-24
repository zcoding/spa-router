import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'amd',
  dest: 'dist/amd/spa-router.js',
  sourceMap: true,
  moduleId: 'spa-router',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ]
};
