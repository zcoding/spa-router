var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var config = require('./package.json');

var source = ['intro.js', 'utils.js', 'rnode.js', 'listener.js', 'router.js', 'outro.js'];

var sourcePath = source.map(function(file) {
  return './src/' + file;
});

gulp.task('build', function() {

  return gulp.src(sourcePath)
      .pipe(concat('spa-router.js'), {newLine: '\n'})
      .pipe(gulp.dest('./build'))
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename('spa-router.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./build'));

});

gulp.task('release', function() {

  return gulp.src(['src/*', 'scripts/*', 'build/*', 'demo/*', 'gulpfile.js', 'LICENSE', 'package.json', 'README.md'], {base: '.'})
    .pipe(zip('spa-router-' + config.version + '.zip'))
    .pipe(gulp.dest('release'));

});

gulp.task('dev', ['build'], function() {

  var watcher = gulp.watch(source, ['build']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
