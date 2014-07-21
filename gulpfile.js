var gulp = require('gulp')
  , clean = require('gulp-clean')
  , compass = require('gulp-compass')
  , concat = require('gulp-concat')
  , es = require('event-stream')
  , nwBuilder = require('node-webkit-builder')
  , path = require('path')
  , purescript = require('gulp-purescript')
  , sass = require('gulp-sass')
  ;

// Configuration.
paths = {
    src: [
        'src/**/*.purs',
        'bower_components/purescript-*/src/**/*.purs',
        'bower_components/purescript-*/src/**/*.purs.hs'
    ],
    dest: 'js',
    style: 'style/**/*.scss',
    css: 'css',
    imgs: 'imgs/*',
    build: {
        browser: {
            css: 'bin/browser/css',
            fonts: 'bin/browser/fonts',
            imgs: 'bin/browser/imgs',
            index: 'bin/browser',
            js: 'bin/browser/js'
        },
        'node-webkit': {
            css: 'bin/node-webkit/css',
            fonts: 'bin/node-webkit/fonts',
            imgs: 'bin/node-webkit/imgs',
            index: 'bin/node-webkit',
            jar: 'bin/node-webkit/jar',
            js: 'bin/node-webkit/js'
        }
    },
    concat: {
        js: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/c3/c3.js',
            'bower_components/d3/d3.js',
            'bower_components/fastclick/lib/fastclick.js',
            'bower_components/foundation/js/foundation.js',
            'bower_components/modernizr/modernizr.js',
            'bower_components/node-uuid/uuid.js',
            'bower_components/oboe/dist/oboe-browser.js',
            'bower_components/react/react-with-addons.js',
            'bower_components/showdown/src/showdown.js',
            'js/slamdata.js'
        ],
        css: [
            'bower_components/c3/c3.css',
            'bower_components/entypo/font/entypo.css',
            'bower_components/fontawesome/css/font-awesome.css'
        ],
        fonts: [
            'bower_components/fontawesome/fonts/*'
        ],
        entypo: [
            'bower_components/entypo/font/entypo.eot',
            'bower_components/entypo/font/entypo.svg',
            'bower_components/entypo/font/entypo.ttf',
            'bower_components/entypo/font/entypo.woff'
        ]
    },
    lib: {
        'node-webkit': {
            src: [
                'lib/node-webkit/src/**/*.purs',
                'lib/node-webkit/bower_components/purescript-*/src/**/*.purs'
            ],
            js: 'lib/node-webkit/js'
        }
    }
}

options = {
    compile: {
        main: 'SlamData',
        output: 'slamdata.js'
    },
    build: {
        main: 'SlamData',
        css: 'slamdata.css',
        index: 'index.html',
        js: 'slamdata.js'
    },
    lib: {
        'node-webkit': {
            main: 'SlamData.SlamEngine',
            output: 'slamengine.js'
        }
    }
}

// Functions.
var concatJs = function(target) {
    return gulp.src(paths.concat.js)
      .pipe(concat(options.build.js))
      .pipe(gulp.dest(paths.build[target].js));
};

var concatCss = function(target) {
    var fa = gulp.src(paths.concat.css);
    var styles = gulp.src(paths.style)
        .pipe(compass({
            import_path: '.',
            project: __dirname,
            sass: 'style'
        }));

    return es.concat(fa, styles)
        .pipe(concat(options.build.css))
        .pipe(gulp.dest(paths.build[target].css));
};

var fonts = function(target) {
    return gulp.src(paths.concat.fonts)
      .pipe(gulp.dest(paths.build[target].fonts));
};

var entypo = function(target) {
    return gulp.src(paths.concat.entypo)
      .pipe(gulp.dest(paths.build[target].css));
};

var imgs = function(target) {
    return gulp.src(paths.imgs)
      .pipe(gulp.dest(paths.build[target].imgs));
};

// Workhorse tasks.
gulp.task('compile', function() {
    // We need this hack for now until gulp does something about
    // https://github.com/gulpjs/gulp/issues/71
    var psc = purescript.psc(options.compile);
    psc.on('error', function(e) {
        console.error(e.message);
        psc.end();
    });
    return gulp.src(paths.src)
        .pipe(purescript.psc(options.compile))
        .pipe(gulp.dest(paths.dest));
});

gulp.task('compile-node-webkit', ['compile'], function() {
    return gulp.src(paths.lib['node-webkit'].src)
        .pipe(purescript.psc(options.lib['node-webkit']))
        .pipe(gulp.dest(paths.lib['node-webkit'].js));
});

gulp.task('clean-sass', function() {
    return gulp.src(paths.css)
      .pipe(clean());
});

gulp.task('sass', ['clean-sass'], function() {
    return gulp.src(paths.style)
        .pipe(compass({
            import_path: '.',
            project: __dirname,
            sass: 'style'
        }))
        .pipe(gulp.dest(paths.css));
});

gulp.task('slamengine-jar', function() {
    return gulp.src('../slamengine/target/scala-2.10/slamengine_2.10-0.1-SNAPSHOT-one-jar.jar')
        .pipe(gulp.dest(paths.build['node-webkit'].jar));
});

gulp.task('slamengine-js', ['compile-node-webkit'], function() {
    return gulp.src('lib/node-webkit/**/*')
        .pipe(gulp.dest('bin/node-webkit'));
});

gulp.task('concat-js-browser', function() {return concatJs('browser');});
gulp.task('concat-css-browser', function() {return concatCss('browser');});
gulp.task('fonts-browser', function() {return fonts('browser');});
gulp.task('entypo-browser', function() {return entypo('browser');});
gulp.task('imgs-browser', function() {return imgs('browser');});

gulp.task('concat-js-node-webkit', ['compile-node-webkit'], function() {return concatJs('node-webkit');});
gulp.task('concat-css-node-webkit', function() {return concatCss('node-webkit');});
gulp.task('fonts-node-webkit', function() {return fonts('node-webkit');});
gulp.task('entypo-node-webkit', function() {return entypo('node-webkit');});
gulp.task('imgs-node-webkit', function() {return imgs('node-webkit');});

gulp.task('build-browser', [
    'compile',
    'concat-js-browser',
    'concat-css-browser',
    'fonts-browser',
    'entypo-browser',
    'imgs-browser'
]);
gulp.task('build-node-webkit', [
    'compile',
    'compile-node-webkit',
    'concat-js-node-webkit',
    'concat-css-node-webkit',
    'fonts-node-webkit',
    'entypo-node-webkit',
    'imgs-node-webkit',
    'slamengine-jar',
    'slamengine-js'
]);

gulp.task('dist-node-webkit', ['compile-node-webkit', 'build-node-webkit'], function() {
    nw = new nwBuilder({
        buildDir: 'dist',
        files: 'bin/node-webkit/**',
        macIcns: 'imgs/slamdata.icns',
        platforms: ['linux64', 'osx', 'win'],
        winIco: 'imgs/slamdata.ico'
    });
    return nw.build();
});

// Main tasks.
gulp.task('build', ['build-browser', 'build-node-webkit']);
gulp.task('default', ['compile', 'sass']);
gulp.task('dist', ['build', 'dist-node-webkit']);
gulp.task('test', ['build']);
gulp.task('watch', function() {
    gulp.watch(paths.src, ['compile']);
    gulp.watch(paths.style, ['sass']);
});
