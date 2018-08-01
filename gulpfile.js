"use strict";

const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');

const config = require(path.join(__dirname, 'gulp-config.js'));

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
    return gulp.src(config.styles.SOURCE_DIR + '**/*.scss')
        .pipe(sass(config.styles.sass_options).on('error', sass.logError))
        .pipe(gulp.dest(config.styles.DEST_DIR));
});


/*
* Watch tasks
*/

gulp.task('watchScripts', function(){
	gulp.watch(config.js.SOURCE_DIR + '**/*.js', gulp.series('concatScripts'));
});

gulp.task('watchSass', function() {
    gulp.watch(config.styles.SOURCE_DIR + '**/*.scss', gulp.series('sass'));
});


/*
* Main gulp tasks
*/
//have to put watchSass sass task dependency here, since if we put it directly on the watchSass task, it will not watch, instead just run once
gulp.task('watch', gulp.parallel([
                                    gulp.series(['sass', 'watchSass']), 
                                    gulp.series(['concatScripts', 'watchScripts'])
                                ]
                            ));
gulp.task('build', gulp.parallel(['sass', 'concatScripts']));
gulp.task('default', gulp.parallel(['build']));