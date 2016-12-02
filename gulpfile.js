'user strict';

var gulp = require('gulp');
var gutil = require('gulp-util');

require('require-dir')('./gulp');

gulp.errorHandler = function (title) {
    return function (err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};

gulp.task('default', ['serve'], function () {
});