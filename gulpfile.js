const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const webpack = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mode = require('gulp-mode')();
const browserSync = require('browser-sync').create();

// clean tasks
const clean = () => {
  return del(['dist']);
}


// css task
const css = () => {
  return src('src/scss/main.scss')
    .pipe(mode.development( sourcemaps.init() ))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('app.css'))
    .pipe(mode.production( csso() ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest('dist'))
    .pipe(mode.development( browserSync.stream() ));
}

// js task
const js = () => {
  return src('src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe(mode.development( sourcemaps.init({ loadMaps: true }) ))
    .pipe(rename('app.js'))
    .pipe(mode.production( terser({ output: { comments: false }}) ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest('dist'))
    .pipe(mode.development( browserSync.stream() ));
}



// watch task
const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  watch('src/scss/**/*.scss', css);
  watch('src/**/*.js', js);
  watch('**/*.html').on('change', browserSync.reload);
  
}

// public tasks
exports.default = series(clean, parallel(css, js, ), watchForChanges);
exports.build = series(clean, parallel(css, js, ));