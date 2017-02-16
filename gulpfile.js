const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');
const bower = require('gulp-bower');
const mocha = require('gulp-mocha');
const run = require('gulp-run');
gulp.task('nodemon', () => {
    nodemon({ script: 'server.js' });
});

gulp.task('server', ['nodemon'], () => {
    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 3568,
        reloadOnRestart: true
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
    gulp.watch('public/css/*.scss', ['sass']);
    gulp.watch(['app/views/**/*.jade', 'public/**/**', 'app/**/*.js'])
        .on('change', browserSync.reload);
});

gulp.task('default', ['server', 'watch']);