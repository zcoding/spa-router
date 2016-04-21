module.exports = function(config) {
  config.set({
    basePath: '../',

    frameworks: ['jasmine'],

    files: [
      'src2/rnode.js',
      'test/test-*.js'
    ],

    exclude: [],

    preprocessors: {
      'src2/rnode.js': ['babel', 'coverage'],
      'test/test-*.js': ['babel']
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },

    reporters: ['progress', 'coverage'],

    coverageReporter: {
      dir: 'test/report',
      reporters: [
        { type: 'html', subdir: 'report-html' }
      ]
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome'],

    singleRun: false,

    concurrency: Infinity
  })
}
