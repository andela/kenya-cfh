import gulp from 'gulp';
import sass from 'gulp-sass';
import browserSync from 'browser-sync';
import bower from 'gulp-bower';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import exit from 'gulp-exit';
import nodemon from 'gulp-nodemon';
import babel from 'gulp-babel';

gulp.task('bower', () => {
  bower().pipe(gulp.dest('./bower_components'));
});

gulp.task('sass', () => gulp.src(['public/css/common.scss'])
  .pipe(sass())
  .pipe(gulp.dest('public/css/')));

gulp.task('watch', () => {
  gulp.watch('public/css/creative.min.css', ['sass']);
  gulp.watch('public/css/**', browserSync.reload());
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('app/**/*.js', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
});

gulp.task('babel', () => {
  gulp.src(['./**/*.js', '!dist/**', '!bower_components/**/*',
    '!node_modules/**',
    '!gulpfile.babel.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('eslint', () => {
  gulp.src(['gulpfile.babel.js',
    'public/js/**/*.js',
    'test/**/*.js',
    'app/**/*.js',
    'config/**/*.js'
  ])
    .pipe(eslint());
});

gulp.task('angular', () => {
  gulp.src('bower_components/angular/**/*.js')
    .pipe(gulp.dest('./dist/public/lib/angular'));
});

gulp.task('angular-bootstrap', () => {
  gulp.src('bower_components/angular-bootstrap/**/*')
    .pipe(gulp.dest('./dist/public/lib/angular-bootstrap'));
});

gulp.task('bootstrap', () => {
  gulp.src('bower_components/bootstrap/dist/**/*')
    .pipe(gulp.dest('./dist/public/lib/bootstrap'));
});

gulp.task('jquery', () => {
  gulp.src('bower_components/jquery/**/*')
    .pipe(gulp.dest('./dist/public/lib/jquery'));
});

gulp.task('underscore', () => {
  gulp.src('bower_components/underscore/**/*')
    .pipe(gulp.dest('./dist/public/lib/underscore'));
});

gulp.task('angularUtils', () => {
  gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('./dist/public/lib/angular-ui-utils/modules'));
});

gulp.task('emojionearea', () => {
  gulp.src('bower_components/emojionearea/dist/**/*')
    .pipe(gulp.dest('./dist/public/lib/emojionearea'));
});

gulp.task('transfer-jade', () => {
  gulp.src('app/views/**/*')
    .pipe(gulp.dest('./dist/app/views'));
});

gulp.task('transfer-json', () => {
  gulp.src('config/env/*.json')
    .pipe(gulp.dest('./dist/config/env'));
});

gulp.task('transfer-public', ['sass'], () => {
  gulp.src(['public/**/*', '!public/js/**'])
    .pipe(gulp.dest('./dist/public'));
});

gulp.task('transfer-bower', ['jquery', 'angular', 'bootstrap', 'angularUtils',
  'underscore', 'angular-bootstrap', 'emojionearea']);
gulp.task('mochaTest', () => {
  gulp.src('./dist/test/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      timeout: '500000'
    }))
    .pipe(exit());
});


gulp.task('nodemon', () => {
  nodemon({
    script: './dist/server.js',
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

gulp.task('build', ['sass', 'transfer-public', 'babel', 'transfer-json',
  'transfer-jade', 'transfer-bower']);

gulp.task('test', ['mochaTest']);

gulp.task('default', ['build', 'nodemon', 'watch']);
