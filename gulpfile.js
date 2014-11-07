/* global -$ */

'use strict';

//TODO
/*
- multiple karma configurations
- fix rimraf
- don't use template.js in dev
- fix less and themes, load bootstrap theme
- watch on ngtemplates
*/

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var argv = require('optimist').argv;
var express = require('express');
var runSequence = require('run-sequence');
require('./gulp/gateway');
var updateAppScripts = require('./util/update-app-scripts');
var wiredep = require('wiredep').stream;
var dev = {
  dir: 'app',
  index: 'app/index.html',
  favicon: 'app/favicon.ico',
  less: 'app/styles/main.less',
  scripts: {
    src: [
      'app/components/**/!(*_test)+(.js)',
      'app/pages/**/!(*_test)+(.js)',
      'app/app!(*_test)+(.js)'
    ],
    test: [
      'app/*_test.js',
      'app/components/**/*_test.js',
      'app/pages/**/*_test.js'
    ]
  },
  clientSettings: 'app/client.settings.js',
  watchDependencies: [
    'app/bower_components/malhar-angular-dashboard/dist/angular-ui-dashboard.js',
    'app/bower_components/malhar-angular-widgets/dist/malhar-angular-widgets.js'
  ],
  images: 'app/images/*',
  fonts: ['app/fonts/*', 'app/bower_components/bootstrap/fonts/*', 'app/bower_components/font-awesome/fonts/*'],
  templates: [
    'app/pages/**/*.html',
    'app/components/**/*.html'
  ]
};

var prod = {
  dir: 'dist',
  images: 'dist/images',
  styles: 'dist/styles',
  fonts: 'dist/fonts'
};

var options = {
  clean: { read: false },
  uglify: { mangle: false }
};

gulp.task('jshint', ['jshint_main', 'jshint_test']);

gulp.task('jshint_main', function () {
  gulp.src(dev.scripts.src)
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('jshint_test', function () {
  return gulp.src(dev.scripts.test)
    .pipe($.jshint('test/.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('test', function () {
  return gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-unit.conf.js',
      //configFile: 'test/karma-coverage.conf.js',
      action: 'run',
      //browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
      browsers: ['PhantomJS']
    }))
    .on('error', function (err) {
      throw err;
    });
});

// !!!Requires optionalDependencies to be installed!!!
gulp.task('testall', function () {
  return gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-unit.conf.js',
      //configFile: 'test/karma-coverage.conf.js',
      action: 'run',
      browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
    }))
    .on('error', function (err) {
      throw err;
    });
});

gulp.task('coverage', function () {
  return gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-coverage.conf.js',
      action: 'run',
      browsers: ['Chrome']
    }))
    .on('error', function (err) {
      throw err;
    });
});

gulp.task('karma:watch', [], function () {
  gulp.src('./idontexist')// force karma to use files in karma.conf, workaround for https://github.com/lazd/gulp-karma/issues/9
    .pipe($.karma({
      configFile: 'test/karma-coverage.conf.js',
      action: 'watch',
      // browsers: ['PhantomJS', 'Firefox', 'Safari', 'Chrome']
      // browsers: ['PhantomJS', 'Chrome']
      browsers: ['Chrome']
    }));
});

gulp.task('less', ['clean'], function () {
  return gulp.src('app/styles/main.less')
    .pipe($.less({
      paths: ['app/styles']
    }))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('ngtemplates', ['clean'], function () {
  return gulp.src(dev.templates, { base: dev.dir })
    .pipe($.ngtemplate({
      module: 'app'
    }))
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('serve', function() {
    runSequence('less', ['connect', 'watch']);
  }
);

gulp.task('serve:dist', ['connect:dist']);

gulp.task('watch', [], function () {
  var server = $.livereload();

  gulp.watch([
    dev.index,
    '.tmp/styles/main.css',
    dev.templates,
    dev.scripts.src,
    dev.scripts.test,
    dev.watchDependencies
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch([
    'app/styles/**/*.less',
    'app/components/**/*.less',
    'app/pages/**/*.less'
  ], ['less']);
});

gulp.task('clean', function() {
  return gulp.src(prod.dir, options.clean)
    .pipe($.rimraf({ force: true }));
});

gulp.task('copy', ['clean','usemin'], function () {
  gulp.src(dev.fonts)
    .pipe(gulp.dest(prod.fonts));

  gulp.src(dev.images)
    .pipe(gulp.dest(prod.images));

  gulp.src(dev.favicon)
    .pipe(gulp.dest(prod.dir));

  gulp.src(dev.clientSettings)
    .pipe(gulp.dest(prod.dir));
});

gulp.task('usemin', ['less','ngtemplates'], function () {
  gulp.src(dev.index)
    //.pipe($.inject(gulp.src(dev.clientSettings), {
    //  read: false,
    //  relative: true,
    //  name: 'settings'
    //}))
    .pipe($.inject(gulp.src('.tmp/templates.js'), {
      read: false,
      relative: true
    }))
    .pipe($.usemin({
      css: [
        $.minifyCss({ relativeTo: 'app/styles'}),
        'concat',
        $.rev()
      ],
      js: [
        $.uglify(options.uglify),
        $.rev()
      ]
    }))
    .pipe(gulp.dest(prod.dir));
});

gulp.task('appscripts', function() {
  updateAppScripts(function() {
    console.log('Application scripts updated in index.html');
  });
});

gulp.task('bower', function () {
  gulp.src(dev.index)
    .pipe(wiredep({
      exclude: ['bower_components/es5-shim/es5-shim.js', 'bower_components/json3/lib/json3.min.js']
    }))
    .pipe(gulp.dest(dev.dir));
});

gulp.task('prodenv', function () {
  if (process.env.DATA_SERVER_HOST) {
    gulp.src(dev.clientSettings)
      .pipe($.replace('http://localhost:3003', process.env.DATA_SERVER_HOST)) //TODO have more configurable replace
      .pipe(gulp.dest(prod.dir));
  }
});

gulp.task('ngdocs', [], function () {

  var options = {
    title: 'API',
    html5Mode: false,
    image: './docs/ngDocNavImage.svg',
    navTemplate: './docs/ngDocNavTemplate.html',
    styles: ['./docs/ngDocStyles.css']

  };
  var ngdocs = require('gulp-ngdocs');
  return gulp.src(dev.scripts.src)
    .pipe($.ngdocs.process(options))
    .pipe(gulp.dest('./ngdocs'))
    .on('error', function(err) {
      console.log('Error from ngdocs: ', err);
    });
});

gulp.task('serve:ngdocs', function(next) {
  var server = express();
  var port = argv.p || 9002;
  server.use(express.static('ngdocs')).listen(port, next);
  console.log('Docs being served at http://localhost:' + port);
});

gulp.task('watch:ngdocs', ['serve:ngdocs'], function() {
  var server = $.livereload(35731);
  gulp.watch(dev.scripts.src, ['ngdocs']);
  gulp.watch('ngdocs/**').on('change', function(file) {
    server.changed(file.path);
  });
});

gulp.task('build', ['clean', 'jshint', 'test', 'copy']);

gulp.task('travis', ['jshint', 'test']);

gulp.task('default', [], function () {
  gulp.start('build');
});
