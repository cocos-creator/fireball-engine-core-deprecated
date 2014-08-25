/*
 * This node module contains some helper function for generating unit test runner automatically
 */

var fs = require('fs');
var Path = require('path');
var through = require('through');
var gutil = require('gulp-util');


var toFileList = function () {
    var firstFile = null;
    var fileList = [];
    function write(file) {
        if (file.isStream()) return this.emit('error', new PluginError('toFileList', 'Streaming not supported'));
        if (!firstFile) firstFile = file;
        fileList.push(file.relative);
    }
    function end() {
        if (firstFile) {
            firstFile.contents = new Buffer(fileList.join(',') + ',');
        }
        else {
            firstFile = new gutil.File({
                contents: new Buffer(0),
            });
        }
        this.emit('data', firstFile);
        this.emit('end');
    }
    return through(write, end);
};

var trySortByDepends = function (fileList, srcList) {
    var indexInSrc = function (filePath) {
        var basename = Path.basename(filePath);
        for (var i = 0; i < srcList.length; i++) {
            if (Path.basename(srcList[i]) === basename) {
                return i;
            }
        }
        return -1;
    };
    fileList.sort(function (lhs, rhs) {
        return indexInSrc(lhs) - indexInSrc(rhs);
    });
}

var generateContents = function (template, fileList, dest, title) {
    var scriptElements = '';
    for (var i = 0; i < fileList.length; i++) {
        if (fileList[i]) {
            if (i > 0) {
                scriptElements += '\r\n    ';
            }
            scriptElements += ('<script src="' + Path.relative(dest, fileList[i]) + '"></script>');
        }
    }
    var data = { file: null, title: title, scripts: scriptElements };
    return new Buffer(gutil.template(template, data));
};

var generateRunner = function (templatePath, dest, title, lib_min, lib_dev, srcList) {
    var template = fs.readFileSync(templatePath);

    function write(file) {
        var fileList = file.contents.toString().split(',');
        trySortByDepends(fileList, srcList);
        // runner.html
        file.contents = generateContents(template, lib_min.concat(fileList), dest, title);
        file.path = Path.join(file.base, Path.basename(templatePath));
        this.emit('data', file);
        // runner.dev.html
        var ext = Path.extname(file.path);
        var filename = Path.basename(file.path, ext) + '.dev' + ext;
        this.emit('data', new gutil.File({
            contents: generateContents(template, lib_dev.concat(fileList), dest, title),
            base: file.base,
            path: Path.join(file.base, filename)
        }));

        this.emit('end');
    }
    return through(write);
};


module.exports = {
    toFileList: toFileList,
    generateRunner: generateRunner
};
