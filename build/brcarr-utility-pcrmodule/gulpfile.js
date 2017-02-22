/*eslint-env es6 */
/*eslint-disable strict*/
'use strict';

const gulp = require('gulp'); 
const plugins = require('gulp-load-plugins')();
const del = require('del');

const metadata = require('./bower.json');
const buildMetadata = require('./package.json');
const build = require('lexmark-package-build')(metadata, buildMetadata);

gulp.task('clean', ()=>del('build'));

gulp.task('init', ()=> {
  build.mkdir.sync('build');
});

gulp.task('dist', ['buildPackage'], ()=>{
    del.sync('build/dist');
    return gulp.src('build/*.min.js')
    .pipe(gulp.dest('build/dist'));
});

gulp.task('lint', ['init'], ()=>
    gulp.src(['src/**/*.js'])
    .pipe(plugins.eslint())
    .pipe(process.env.BUILD_NUMBER ?
          plugins.eslint.format('checkstyle', build.createWriteStream('build/reports/eslint/*.checkstyle.xml')) :
          plugins.eslint.format('stylish'))
    .pipe(plugins.eslint.failAfterError())
); 

gulp.task('test', ['buildPackage'], ()=>{ /*No tests yet*/ });
gulp.task('buildPackage', ['init'], ()=> build.rjsBuild());
gulp.task('buildPackageDebug', ['init'], ()=>build.rjsBuild({optimize: 'none'}) );

gulp.task('build', ['lint', 'dist', 'test']);
gulp.task('default', ['build']);