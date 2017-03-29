'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');
const bower = require('gulp-bower');
const mocha = require('gulp-mocha');
const run = require('gulp-run');
const livereload = require('gulp-livereload');

gulp.task('nodemon', () => {
    nodemon({ script: 'server.js' });
});

gulp.task('server', ['nodemon'], () => {
    browserSync.create({
        proxy: "http://localhost:3000",
        port: 7000,
        files: ["public/**/*.*"],
        reloadOnRestart: true,
        notify: false
    });
});

gulp.task('sass', () => {
    return gulp.src('public/css/common.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('bower', () => {
    bower()
        .pipe(gulp.dest('./public/lib/'));
});
gulp.task('test', () => {
    run('karma start karma2.conf.js').exec();
});
gulp.task('watch', () => {
    gulp.watch('public/css/common.scss', ['sass']);
    gulp.watch('public/css/*.css');
    gulp.watch('public/css/**', browserSync.create().reload);
    gulp.watch('app/views/**', browserSync.create().reload);
    gulp.watch('public/views/**', browserSync.create().reload);
    gulp.watch(['public/js/**', 'app/**/*.js'], browserSync.create().reload);
    livereload.listen();
});

gulp.task('default', ['sass','server', 'watch']);