import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['es2015-rollup']
    })
  ],
  targets: [
    {
      format: 'amd',
      moduleId: 'spa-router',
      dest: 'dist/amd/spa-router.js'
    },
    {
      format: 'es',
      dest: 'dist/es/spa-router.js'
    },
    {
      format: 'cjs',
      dest: 'dist/cjs/spa-router.js'
    },
    {
      format: 'iife',
      moduleName: 'Router',
      dest: 'dist/iife/spa-router.js'
    }
  ]
};
