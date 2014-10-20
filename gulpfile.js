var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');

gulp.task('styles', function() {
  return gulp.src('sass/*.scss')
    .pipe(sass({
      style: 'expanded',
      compass: true
    }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(gulp.dest('css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css'));
});

gulp.task('watch', function() {

  gulp.watch('sass/*.scss', ['styles']);

  var bundler = watchify(browserify('./src/index.js', watchify.args));

  // Optionally, you can apply transforms
  // and other configuration options on the
  // bundler just as you would with browserify
  // bundler.transform('brfs');
  bundler.on('update', rebundle);

  function rebundle() {
    gutil.log('Rebundling src.js -> app.js');
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(gulp.dest('./js'));
  }

  return rebundle();
});
