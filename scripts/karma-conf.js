module.exports = function(config) {
  config.set({
    basePath: '../',

    frameworks: ['jasmine'],

    files: [
      'src/!(intro|outro)*.js',
      'test/test-*.js'
    ],

    exclude: [],

    preprocessors: {
      'src/!(intro|outro)*.js': ['coverage']
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
