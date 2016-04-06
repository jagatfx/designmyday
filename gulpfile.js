var gulp      = require('gulp');
var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');

gulp.task('js-fef', function(){
    return gulp.src(['public/js/main.js', 'public/js/modernizr.js', 'public/js/landio.min.js'])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('public/js'))
        .pipe(gp_rename('script.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('public/js'));
});

gulp.task('default', ['js-fef'], function(){});
