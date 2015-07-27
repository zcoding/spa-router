var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var config = require('./package.json');

var source = ['utils.js', 'rnode.js', 'listener.js', 'router.js'];

var sources = {
  "window": ['intro-window.js'].concat(source).concat(['outro-wrapper.js']),
  "cmd": ['intro-cmd.js'].concat(source).concat(['outro-wrapper.js']),
  "amd": ['intro-amd.js'].concat(source).concat(['outro-wrapper.js']),
  "commonjs": ['intro.js'].concat(source).concat(['outro.js'])
};

var exportsTypes = ['window', 'commonjs', 'cmd', 'amd'];

exportsTypes.forEach(function(eType) {

  var source = sources[eType];
  var sourcePath = source.map(function(file) {
    return './src/' + file;
  });

  gulp.task('build-' + eType, function() {

    return gulp.src(sourcePath)
        .pipe(concat('spa-router.js'), {newLine: '\n'})
        .pipe(gulp.dest('./build/' + eType))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename('spa-router.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./build/' + eType));

  });
});

gulp.task('build', exportsTypes.map(function(eType) {
  return 'build-' + eType;
}));

gulp.task('release', function() {

  return gulp.src(['src/**/*', 'scripts/**/*', 'build/**/*', 'demo/**/*', 'gulpfile.js', 'LICENSE', 'package.json', 'README.md'], {base: '.'})
    .pipe(zip('spa-router-' + config.version + '.zip'))
    .pipe(gulp.dest('release'));

});

gulp.task('dev', ['build'], function() {

  var watcher = gulp.watch(source, ['build']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
