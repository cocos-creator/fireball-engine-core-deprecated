//
FIRE.isnode = !!(typeof(process) !== 'undefined' && process.versions && process.versions.node);
FIRE.isnw = !!(FIRE.isnode && 'node-webkit' in process.versions);   // node-webkit
FIRE.isas = !!(FIRE.isnode && 'atom-shell' in process.versions);    // atom-shell
FIRE.isapp = FIRE.isnw || FIRE.isas;                                // native client
FIRE.isweb = !FIRE.isnode && !FIRE.isapp;

if (FIRE.isnode) {
    FIRE.isdarwin = process.platform === 'darwin';
    FIRE.iswin32 = process.platform === 'win32';
}
else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var platform = window.navigator.platform;
    FIRE.isdarwin = platform.substring(0, 3) === 'Mac';
    FIRE.iswin32 = platform.substring(0, 3) === 'Win';
}

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
        var persistentId = 'SaveFileDialog';
        var chooser = document.getElementById(persistentId);
        if (chooser) {
            // remove the old one or change event may not fired
            document.body.removeChild(chooser);
        }
        chooser = document.createElement('input');
        document.body.appendChild(chooser);
        chooser.id = persistentId;
        chooser.style.display = 'none';
        chooser.type = 'file';

        chooser.nwsaveas = defaultFilename;
        var defaultDir = localStorage[preserveDirKey];
        chooser.nwworkingdir = defaultDir || '';
        
        chooser.onchange = function (evt) {
            document.body.removeChild(chooser);
            //chooser.removeEventListener("change", arguments.callee);
            chooser.onchange = null;
            //console.log('value ' + this.value);
            localStorage[preserveDirKey] = this.value;
            callback(this.value);
        };
        chooser.click();
    };
    var nwgui = require('nw.gui');
    FIRE.showItemInFolder = nwgui.Shell.showItemInFolder;
}
else if (FIRE.isas) {
    FIRE.getSavePath = function (defaultFilename, preserveDirKey, callback, title, browserWindow) {
        var defaultDir = localStorage[preserveDirKey];
        var defaultPath = null;
        if (defaultDir && typeof defaultDir === 'string') {
            defaultDir = FIRE.Path.dirname(defaultDir);
            defaultPath = FIRE.Path.join(defaultDir, defaultFilename);
        }
        var remote = require('remote');
        var dialog = remote.require('dialog');
        var options = {
            title: title,
            defaultPath: defaultPath,
        };
        if (!browserWindow) {
            browserWindow = remote.getCurrentWindow();
        }
        dialog.showSaveDialog(browserWindow, options, function (path) {
            if (path) {
                localStorage[preserveDirKey] = path;
            }
            callback(path);
        });
    };
    var shell = require('shell');
    FIRE.showItemInFolder = shell.showItemInFolder;
}
else {
    var error = function () {
        throw "This function can only be used in node-webkit or atom-shell";
    };
    FIRE.getSavePath = error;
    FIRE.showItemInFolder = error;
}
