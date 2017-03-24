const gulp = require('gulp');
const browserSync = require('browser-sync').create();
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
    browserSync.init({
        proxy: "http://localhost:3000",
        port: 7000,
        files: ["public/**/*.*"],
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
    gulp.watch('public/css/common.scss', ['sass']);
    gulp.watch('public/css/*.css');
    gulp.watch('public/css/**', browserSync.reload);
    gulp.watch('app/views/**', browserSync.reload);
    gulp.watch('public/views/**', browserSync.reload);
    gulp.watch(['public/js/**', 'app/**/*.js'], browserSync.reload)
    livereload.listen();
});

gulp.task('default', ['nodemon','sass','server', 'watch', 'bower']);