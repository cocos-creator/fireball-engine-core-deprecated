var gulp = require('gulp');

var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var qunit = require('gulp-qunit');

var fb = require('gulp-fb');

var paths = {
    src: [
        'src/__intro.js',

        // javascript extends
        'src/define.js',
        'src/core.js',
        'src/math.js',

        // basic classes
        'src/attribute.js',
        'src/class.js',
        'src/utils.js',
        'src/path.js',
        'src/serialize.js',
        'src/deserialize.js',
        'src/object.js',
        'src/hash-object.js',
        'src/vec2.js',
        'src/matrix23.js',
        'src/rect.js',
        'src/color.js',

        // assets
        'src/asset/asset.js',
        'src/asset/texture.js',
        'src/asset/sprite.js',
        'src/asset/atlas.js',
        'src/asset/font-info.js',

        // editor utils
        'src/editor/utils.js',
        'src/editor/platform.js',
        'src/editor/dom.js',
        'src/editor/file-utils.js',

        'src/__outro.js',
    ],
    dev: 'bin/core.dev.js',
    min: 'bin/core.min.js',

    test: {
        src: 'test/unit/**/*.js',
        runner: 'test/lib/runner.html',
        lib_dev: [
            'bin/core.dev.js',
        ],
        lib_min: [
            'bin/core.min.js',
        ],
    },

    ref: {
        src: [
            'test/lib/*.js',
            'test/unit/_*.js',
        ],
        dest: '_references.js',
    },
};

// clean
gulp.task('clean', function() {
    del('bin/');
});

// js-hint
gulp.task('jshint', function() {
    return gulp.src(paths.src.concat( ['!**/__intro.js','!**/__outro.js'] ))
    .pipe(jshint({
        forin: false,
        multistr: true,
    }))
    .pipe(jshint.reporter(stylish))
    ;
});

// dev
gulp.task('dev', ['jshint'], function() {
    return gulp.src(paths.src)
    .pipe(concat('core.dev.js'))
    .pipe(gulp.dest('bin'))
    ;
});

// min
gulp.task('min', ['dev'], function() {
    return gulp.src('bin/core.dev.js')
    .pipe(rename('core.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('bin'))
    ;
});

/////////////////////////////////////////////////////////////////////////////
// test
/////////////////////////////////////////////////////////////////////////////

gulp.task('unit-runner', function() {
    var js = paths.test.src;
    var dest = paths.test.src.split('*')[0];
    return gulp.src(js, { read: false, base: './' })
               .pipe(fb.toFileList())
               .pipe(fb.generateRunner(paths.test.runner,
                                         dest,
                                         'Fireball Core Test Suite',
                                         paths.test.lib_min,
                                         paths.test.lib_dev,
                                         paths.src))
               .pipe(gulp.dest(dest))
               ;
});

gulp.task('test', ['min', 'unit-runner'], function() {
    return gulp.src(['test/unit/**/*.html', '!**/*.dev.*'], { read: false })
                .pipe(qunit())
                ;
});

/////////////////////////////////////////////////////////////////////////////
// tasks
/////////////////////////////////////////////////////////////////////////////

// ref
gulp.task('ref', function() {
    var src = paths.src;//.concat(['!src/__intro.js', '!src/__outro.js']);
    var files = paths.ref.src.concat(src);
    var destPath = paths.ref.dest;
    return fb.generateReference(files, destPath);
});

// watch
gulp.task('watch', function() {
    gulp.watch(paths.src, ['dev']).on( 'error', gutil.log );
});
gulp.task('watch-self', function() {
    gulp.watch(paths.src, ['dev']).on( 'error', gutil.log );
});

//
gulp.task('all', ['min', 'test', 'ref'] );
gulp.task('ci', ['min', 'test'] );
gulp.task('default', ['min'] );
