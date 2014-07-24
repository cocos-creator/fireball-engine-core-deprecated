//
FIRE.isnode = !!(typeof(process) !== 'undefined' && process.versions && process.versions.node);
FIRE.isnw = !!(FIRE.isnode && process.versions['node-webkit']);
FIRE.isweb = !FIRE.isnode && !FIRE.isnw;

if (FIRE.isnode) {
    var Fs = require('fs');
    var Path = require('path');

    FIRE.Path = Path;

    var _readDirRecursively = function ( dirPath, resultArray ) {
        var fileList = Fs.readdirSync(dirPath);
        var stat = null;
        var path = '';
        for (var i = 0; i < fileList.length; i++) {
            path = Path.join(dirPath, fileList[i]);
            try {
                stat = Fs.statSync(path);
            }
            catch (e) {
                continue;
            }
            if (stat.isFile()) {
                resultArray.push(path);
            }
            else if (stat.isDirectory()) {
                _readDirRecursively(path, resultArray);
            }
        }
    };
    FIRE.readDirRecursively = function ( path ) {
        var retval = [];
        if (Array.isArray(path)) {
            for (var i = 0; i < path.length; i++) {
                retval = retval.concat(FIRE.readDirRecursively(path[i]));
            }
            return retval;
        }
        var stat = null;
        //var entry = event.dataTransfer.items[i].webkitGetAsEntry();
        try {
            stat = Fs.statSync(path);
        }
        catch (e) {
            return [];
        }
        if (stat.isFile()) {
            retval.push(path);
        }
        else if (stat.isDirectory()) {
            _readDirRecursively(path, retval);
        }
        return retval;
    };
}
else {
    var error = function () {
        throw "This function can only be used in node-webkit or server";
    };
    FIRE.readDirRecursively = error;

    FIRE.Path = {};
    FIRE.Path.basename = function (path) {
        return path.replace(/^.*(\\|\/|\:)/, '');
    };
    FIRE.Path.extname = function (path) {
        return path.substring((~-path.lastIndexOf(".") >>> 0) + 1);
    };
}

FIRE.Path.setExtension = function (path, newExtension) {
    // if (FIRE.isnode) return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path))) + newExtension;
    var dotIndex = (~-path.lastIndexOf(".") >>> 0) + 1;
    return path.substring(0, dotIndex) + newExtension;
};

if (FIRE.isnw) {
    FIRE.getSavePath = function (defaultFilename, preserveDirKey, callback) {
        var chooser = document.createElement('input');
        chooser.type = 'file';
        chooser.nwsaveas = defaultFilename;
        var defaultDir = localStorage[preserveDirKey];
        if (defaultDir) {
            chooser.nwworkingdir = defaultDir;
        }
        chooser.addEventListener("change", function (evt) {
            localStorage[preserveDirKey] = this.value;
            callback(this.value);
        }, false);
        chooser.click();
    };
}
else {
    var error = function () {
        throw "This function can only be used in node-webkit";
    };
    FIRE.getSavePath = error;
}
