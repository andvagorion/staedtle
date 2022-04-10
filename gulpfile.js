'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
var del = require('del');

const paths = {
    styles: {
        src: './src/sass/app.scss',
        dest: './dist/assets/'
    },
    scripts: {
        src: './src/**/*.js',
        dest: './dist/assets/'
    },
    assets: {
        src: './src/img/**.*',
        dest: './dist/assets/'
    }
};

function clean() {
    return del(['./dist/assets']);
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest(paths.scripts.dest));
}

function assets() {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dest));
}

var build = gulp.series(clean, gulp.parallel(styles, assets));

exports.default = build;
