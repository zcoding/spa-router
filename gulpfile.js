var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var source = ['utils.js', 'rnode.js', 'listener.js', 'router.js'];

var sources = {
  "global": ['intro-global.js'].concat(source).concat(['outro-wrapper.js']),
  "cmd": ['intro-cmd.js'].concat(source).concat(['outro-wrapper.js']),
  "amd": ['intro-amd.js'].concat(source).concat(['outro-wrapper.js']),
  "commonjs": ['intro.js'].concat(source).concat(['outro.js'])
};

var exportsTypes = ['global', 'commonjs', 'cmd', 'amd'];

exportsTypes.forEach(function(eType) {

  var source = sources[eType];
  var sourcePath = source.map(function(file) {
    return './src/' + file;
  });

  gulp.task('build-' + eType, function() {

    return gulp.src(sourcePath)
        .pipe(concat('spa-router.js'), {newLine: '\n'})
        .pipe(gulp.dest('./dist/' + eType))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename('spa-router.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/' + eType));

  });
});

gulp.task('build', exportsTypes.map(function(eType) {
  return 'build-' + eType;
}));

gulp.task('dev', ['build'], function() {

  var source = sources['global'];
  var sourcePath = source.map(function(file) {
    return './src/' + file;
  });

  var watcher = gulp.watch(sourcePath, ['build']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
