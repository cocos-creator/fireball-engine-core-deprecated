//
FIRE.isnw = (typeof(process) !== 'undefined' && process.versions && process.versions['node-webkit']);
FIRE.isnode = FIRE.isnw;

//
FIRE.setExtension = function ( path, newExtension ) {
    if ( FIRE.isnode ) {
        var Path = require('path');
        return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path))) + newExtension;
    }

    console.warn("This function can only be used in node-webkit or server");
    return path;
};

FIRE.readDirRecursively = (function () {
    if (FIRE.isnode) {
        var Fs = require('fs');
        var Path = require('path');

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

        return function ( path ) {
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
        return function () {
            console.error("This function can only be used in node-webkit or server");
            return [];
        };
    }
})();
