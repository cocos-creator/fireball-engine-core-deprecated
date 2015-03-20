var Path = require('path');

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglifyjs');
var concat = require('gulp-concat');
var qunit = require('gulp-qunit');
var preprocess = require('gulp-preprocess');

var fb = require('gulp-fb');

var paths = {
    src: [
        'src/__intro.js',

        'src/editor/pre-define.js',

        // javascript extends
        'src/definition.js',
        'src/core.js',
        'src/math.js',
        'src/intersection.js',
        'src/callbacks-invoker.js',

        // basic classes utility
        'src/utils.js',
        'src/attribute.js',
        'src/class.js',
        'src/path.js',
        'src/object.js',
        'src/hash-object.js',
        'src/vec2.js',
        'src/matrix23.js',
        'src/rect.js',
        'src/polygon.js',
        'src/color.js',
        'src/deserialize.js',
        'src/instantiate.js',

        // assets
        'src/asset/asset.js',
        'src/asset/custom-asset.js',
        'src/asset/script-asset.js',
        'src/asset/texture.js',
        'src/asset/sprite.js',
        'src/asset/atlas.js',
        'src/asset/atlas-utils.js',
        'src/asset/json-asset.js',
        'src/asset/text-asset.js',
        'src/asset/bitmap-font.js',

        // editor utils
        'src/editor/serialize.js',
        'src/editor/serialize-nicify.js',

        'src/__outro.js'
    ],
    player_dev: 'bin/core.player.dev.js',
    player: 'bin/core.player.js',

    test: {
        src: 'test/unit/**/*.js',
        runner: 'test/lib/runner.html',
        lib_dev: [
            'bin/dev/core.js',
        ],
        lib_min: [
            'bin/min/core.js',
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
        loopfunc: true
        }))
    .pipe(jshint.reporter(stylish))
    ;
});

// js dev
gulp.task('js-dev', function() {
    return gulp.src(paths.src)
    .pipe(preprocess({context: { EDITOR: true, DEBUG: true, DEV: true }}))
    .pipe(concat('core.js'))
    .pipe(gulp.dest('bin/dev'))
    ;
});

// js min
gulp.task('js-min', function() {
    return gulp.src(paths.src)
    .pipe(preprocess({context: { EDITOR: true, DEV: true }}))
    .pipe(concat('core.js'))
    .pipe(uglify({
            compress: {
                dead_code: false,
                unused: false
            }
        }))
    .pipe(gulp.dest('bin/min'))
    ;
});

// player dev
gulp.task('js-player-dev', function() {
    return gulp.src(paths.src.concat('!**/editor/**'))
    .pipe(preprocess({context: { PLAYER: true, DEBUG: true, DEV: true }}))
    .pipe(concat(Path.basename(paths.player_dev)))
    .pipe(gulp.dest(Path.dirname(paths.player_dev)))
    ;
});

// player
gulp.task('js-player', function() {
    return gulp.src(paths.src.concat('!**/editor/**'))
    .pipe(preprocess({context: { PLAYER: true }}))
    .pipe(concat(Path.basename(paths.player)))
    .pipe(gulp.dest(Path.dirname(paths.player)))
    ;
});

gulp.task('dev', ['jshint', 'js-dev', 'js-player-dev', 'js-player']);
gulp.task('min', ['jshint', 'js-min', 'js-player-dev', 'js-player']);
gulp.task('default', ['dev', 'min']);

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

gulp.task('test', ['js-min', 'js-dev', 'unit-runner'], function() {
    var timeOutInSeconds = 5;
    return gulp.src(['test/unit/**/*.html', '!**/*.dev.*'], { read: false })
               .pipe(qunit({ timeout: timeOutInSeconds }))
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

gulp.task('all', ['default', 'test', 'ref'] );
gulp.task('ci', ['jshint', 'test'] );

// watch
gulp.task('watch', function() {
    gulp.watch(paths.src, ['dev']).on( 'error', gutil.log );
});
