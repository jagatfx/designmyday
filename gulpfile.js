var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

gulp.task('sass', function () {
  return gulp.src('public/scss/landio.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ errLogToConsole: false, }))
    .on('error', function(err) {
        notify({
          "sound": "Morse"
        }).write(err);
        this.emit('end');
    })
    .pipe(autoprefixer({
      browsers: [
        "Explorer >= 10",
        "iOS >= 9.3", // Apple iPhone 5
        "Android >= 5"
      ]
    }))
    .pipe(cleanCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('js-fef', function(){
    return gulp.src(['public/js/main.js',
      'public/js/modernizr.js',
      'public/js/plugins/jquery.waypoints.min.js',
      'public/js/plugins/video.js',
      'public/js/landio.js'])
        .pipe(concat('concat.js'))
        .pipe(gulp.dest('public/js'))
        .pipe(rename('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('default', ['js-fef'], function(){});
