"use strict";

var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');
var sass = require('gulp-sass');

var config = require(path.join(__dirname, 'gulp-config.js'));

/*
* JavaScript Tasks
*/
gulp.task('concatScripts', function(){
	return gulp.src(config.js.app_files)
		.pipe(concat(config.js.DIST_NAME + '.js'))
		.pipe(gulp.dest(config.js.DEST_DIR));
});

// gulp.task('minifyScripts', ['concatScripts'], function(){
// 	return gulp.src(path.join(config.js.DEST_DIR, config.js.DIST_NAME + '.js'))
// 		.pipe(uglify())
// 		.pipe(rename(config.js.DIST_NAME + '.min.js'))
// 		.pipe(gulp.dest(config.js.DEST_DIR));
// });

/*
* Sass/Styles Tasks
*/
gulp.task('sass', function() {
    gulp.src(config.styles.SOURCE_DIR + '**/*.scss')
        .pipe(sass(config.styles.sass_options).on('error', sass.logError))
        .pipe(gulp.dest(config.styles.DEST_DIR));
});


/*
* Watch tasks
*/

gulp.task('watchScripts', ['concatScripts'], function(){
	gulp.watch(config.js.SOURCE_DIR + '**/*.js', ['concatScripts']);
});

gulp.task('watchSass', ['sass'], function() {
    gulp.watch(config.styles.SOURCE_DIR + '**/*.scss', ['sass']);
});


/*
* Main gulp tasks
*/
gulp.task('watch', ['watchSass', 'watchScripts']);
gulp.task('build', ['sass', 'concatScripts']);
gulp.task('default', ['build']);