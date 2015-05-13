//npm install gulp-jshint gulp-sass gulp-concat gulp-uglify gulp-rename --save-dev

//引入gulp
var gulp = require('gulp');


////检查脚本
//var jshint = require('gulp-jshint');
//gulp.task('lint', function () {
//    gulp.src('./js/!*.js')
//        .pipe(jshint())
//        .pipe(jshint.reporter('default'));
//});


//编译sass,压缩css
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
gulp.task('sass', function () {
    gulp.src('css/css.scss')
        //编译
        .pipe(sass())
        .pipe(gulp.dest('out'))
        //压缩
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss())
        .pipe(gulp.dest('out'));
});


//合并,压缩文件js
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
gulp.task('js', function () {
    gulp.src('js/*.js')
        //合并
        .pipe(concat('js.js'))
        .pipe(gulp.dest('out'))
        //压缩
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('out'));
});


//默认任务
gulp.task('default', function () {
    //监听文件变化
    gulp.watch(['css/**'], function () {
        gulp.run('sass');
    });
    gulp.watch(['js/*.js'], function () {
        gulp.run('js');
    });
});