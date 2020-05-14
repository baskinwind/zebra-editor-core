const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('./tsconfig.json');

function clean() {
  return del(['lib']);
}

function compileTS() {
  return gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('lib'));
}

exports.build_ts = gulp.series(clean, compileTS);
