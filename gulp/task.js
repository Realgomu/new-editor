'user strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'del', 'run-sequence']
});
var path = require('path');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var reload = browserSync.reload;

browserSync.use(browserSyncSpa({
    selector: '[ng-app]' // Only needed for angular apps
}));

function browserSyncInit(startPath, browser) {
    browser = browser || 'default';
    startPath = startPath || '/';
    var baseDir = ['.tmp', 'src'];
    var files = ['.tmp/**/*.*'];

    browserSync.instance = browserSync.init(files, {
        startPath: startPath,
        server: {
            baseDir: baseDir,
            routes: {
                '/node_modules': 'node_modules',
                '/src': 'src'
            }
        },
        port: 4001,
        browser: browser,
    });
}

gulp.task('tsc', () => {
    return gulp
        .src([
            'src/**/*.ts'
        ])
        .pipe($.sourcemaps.init())
        .pipe($.typescript({
            module: 'system',
            target: 'ES5',
            outFile: 'editor.js'
        })).on('error', gulp.errorHandler('typescript'))
        .pipe($.sourcemaps.write('.', { sourceRoot: '/src-ts' }))
        .pipe(gulp.dest('.tmp'));
})

gulp.task('copy', () => {
    return gulp
        .src(['src/index.html'])
        .pipe(gulp.dest('.tmp'));
})

gulp.task('watch', () => {
    gulp.watch(['src/**/*.ts'], () => {
        gulp.start('tsc');
    });
    gulp.watch(['src/**/*.html'], () => {
        gulp.start('copy');
    });
})

gulp.task('serve', () => {
    $.runSequence('tsc', 'copy', 'watch', (cb) => {
        browserSyncInit();
    });
})