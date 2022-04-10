'use strict';

const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const replace = require('gulp-token-replace');

const today = (new Date()).toISOString().split('T')[0];

const config = {
    main: {
        version: today
    }
};

const paths = {
    styles: {
        src: './src/sass/app.scss',
        dest: './dist/assets/'
    },
    scripts: {
        src: [
            './src/js/map.data.js',
            './src/js/geo.util.js',
            './src/js/toast.util.js',
            './src/js/modal.util.js',
            './src/js/theme.util.js',
            './src/js/point.util.js',
            './src/js/coordinates.util.js',
            './src/js/states.data.js',
            './src/js/cities.data.js',
            './src/js/autocomplete.component.js',
            './src/js/result.dialog.js',
            './src/js/stats.util.js',
            './src/js/game.component.js'
        ],
        dest: './dist/assets/'
    },
    html: {
        src: './src/*.html',
        dest: './dist/'
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
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.scripts.dest));
}

function html() {
    return gulp.src(paths.html.src)
        .pipe(replace({ global: config }))
        .pipe(gulp.dest(paths.html.dest));
}

function assets() {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dest));
}

var build = gulp.series(clean, gulp.parallel(html, styles, scripts, assets));

exports.default = build;
