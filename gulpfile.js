const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const bower = require('gulp-bower');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const exit = require('gulp-exit');
const nodemon = require('gulp-nodemon');

gulp.task('bower', function() {
    bower().pipe(gulp.dest('./bower_components'));
  });

gulp.task('sass', function() {
    return gulp.src(['public/css/common.scss', 'public/css/views/articles.scss'])
        .pipe(sass())
        .pipe(gulp.dest('public/css/'))
});

gulp.task('watch', function() {
    gulp.watch('public/css/common.scss', ['sass']);
    gulp.watch('public/css/**', browserSync.reload());
    gulp.watch('app/views/**', browserSync.reload());
    gulp.watch('public/js/**', browserSync.reload());
    gulp.watch('app/**/*.js', browserSync.reload());
    gulp.watch('public/views/**', browserSync.reload());
}); 

gulp.task('eslint', function() {
    gulp.src(['gulpfile.babel.js',
        'public/js/**/*.js',
        'test/**/*.js',
        'app/**/*.js',
        'config/**/*.js'
      ])
      .pipe(eslint());
  });
  
gulp.task('angular', function() {
    gulp.src('bower_components/angular/**/*.js')
      .pipe(gulp.dest('./public/lib/angular'));
  });

gulp.task('angular-bootstrap', function() {
    gulp.src('bower_components/angular-bootstrap/**/*')
      .pipe(gulp.dest('./public/lib/angular-bootstrap'));
  });
  
gulp.task('bootstrap', function() {
    gulp.src('bower_components/bootstrap/**/*')
      .pipe(gulp.dest('./public/lib/bootstrap'));
  });
  
gulp.task('jquery', function() {
    gulp.src('bower_components/jquery/**/*')
      .pipe(gulp.dest('./public/lib/jquery'));
  });

  gulp.task('underscore', function() {
    gulp.src('bower_components/underscore/**/*')
      .pipe(gulp.dest('./public/lib/underscore'));
  });
  
gulp.task('angularUtils', function() {
    gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
      .pipe(gulp.dest('./public/lib/angular-ui-utils/modules'));
  });

gulp.task('transfer-bower', ['jquery','angular', 'bootstrap', 'angularUtils','underscore', 'angular-bootstrap']);
  
gulp.task('test', function() {
    gulp.src('./test/**/*.js')
      .pipe(mocha({
        reporter: 'spec',
        timeout: '500000'
      }))
      .pipe(exit());
  });


gulp.task('nodemon', function() {
  nodemon({
    script: 'server.js', 
    ext: 'js html jade json scss css',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['app', 'config', 'public', 'server.js'], 
    env: {
      PORT: 3000,
      NODE_ENV: 'development'
    }
  });
});
  
gulp.task('install', ['bower']);
  
gulp.task('build', ['sass', 'transfer-bower']);
  
gulp.task('default', ['build', 'nodemon', 'watch']);
