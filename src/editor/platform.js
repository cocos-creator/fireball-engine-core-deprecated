//

if (Fire.isNode) {
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
    Fire.readDirRecursively = function ( path ) {
        var retval = [];
        if (Array.isArray(path)) {
            for (var i = 0; i < path.length; i++) {
                retval = retval.concat(Fire.readDirRecursively(path[i]));
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
        throw new Error("This function can only be used in node-webkit or server");
    };
    Fire.readDirRecursively = error;
}

if (Fire.isApp && Fire.isWeb) {
    if (Fire.isNodeWebkit) {
        Fire.getSavePath = function (defaultFilename, persistDirKey, callback) {
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
            var defaultDir = localStorage[persistDirKey];
            chooser.nwworkingdir = defaultDir || '';
        
            chooser.onchange = function (evt) {
                document.body.removeChild(chooser);
                //chooser.removeEventListener("change", arguments.callee);
                chooser.onchange = null;
                //Fire.log('value ' + this.value);
                localStorage[persistDirKey] = this.value;
                callback(this.value);
            };

            //chooser.addEventListener("change", function (evt) {
            //    Fire.log('change');
            //}, false);
            //chooser.addEventListener("blur", function (evt) {
            //    Fire.log('blur');
            //}, false);
            //chooser.addEventListener("load", function (evt) {
            //    Fire.log('load');
            //}, false);
            //chooser.addEventListener("unload", function (evt) {
            //    Fire.log('unload');
            //}, false);
            //chooser.addEventListener("abort", function (evt) {
            //    Fire.log('abort');
            //}, false);
            //chooser.addEventListener("click", function (evt) {
            //    Fire.log('click');
            //}, false);
            //chooser.addEventListener("error", function (evt) {
            //    Fire.log('error');
            //}, false);
            //chooser.addEventListener("resize", function (evt) {
            //    Fire.log('resize');
            //}, false);
            //chooser.addEventListener("select", function (evt) {
            //    Fire.log('select');
            //}, false);
            //chooser.addEventListener("submit", function (evt) {
            //    Fire.log('submit');
            //}, false);
            //chooser.addEventListener("reset", function (evt) {
            //    Fire.log('reset');
            //}, false);
            //chooser.addEventListener("focus", function (evt) {
            //    Fire.log('focus');
            //}, false);
            //chooser.addEventListener("focusin", function (evt) {
            //    Fire.log('focusin');
            //}, false);
            //chooser.addEventListener("focusout", function (evt) {
            //    Fire.log('focusout');
            //}, false);
            //chooser.addEventListener("error", function (evt) {
            //    Fire.log('error');
            //}, false);


            //chooser.addEventListener("change", function (evt) {
            //    Fire.log('change');
            //}, true);
            //chooser.addEventListener("blur", function (evt) {
            //    Fire.log('blur');
            //}, true);
            //chooser.addEventListener("load", function (evt) {
            //    Fire.log('load');
            //}, true);
            //chooser.addEventListener("unload", function (evt) {
            //    Fire.log('unload');
            //}, true);
            //chooser.addEventListener("abort", function (evt) {
            //    Fire.log('abort');
            //}, true);
            //chooser.addEventListener("click", function (evt) {
            //    Fire.log('click');
            //}, true);
            //chooser.addEventListener("error", function (evt) {
            //    Fire.log('error');
            //}, true);
            //chooser.addEventListener("resize", function (evt) {
            //    Fire.log('resize');
            //}, true);
            //chooser.addEventListener("select", function (evt) {
            //    Fire.log('select');
            //}, true);
            //chooser.addEventListener("submit", function (evt) {
            //    Fire.log('submit');
            //}, true);
            //chooser.addEventListener("reset", function (evt) {
            //    Fire.log('reset');
            //}, true);
            //chooser.addEventListener("focus", function (evt) {
            //    Fire.log('focus');
            //}, true);
            //chooser.addEventListener("focusin", function (evt) {
            //    Fire.log('focusin');
            //}, true);
            //chooser.addEventListener("focusout", function (evt) {
            //    Fire.log('focusout');
            //}, true);
            //chooser.addEventListener("error", function (evt) {
            //    Fire.log('error');
            //}, true);
            chooser.click();
            //chooser.value = '';
            //chooser.files = new FileList();
            //chooser.files.append(new File('',''));
            //chooser.files = null;
        };
        var nwgui = require('nw.gui');
        Fire.showItemInFolder = nwgui.Shell.showItemInFolder;
    }
    /*else if (Fire.isAtomShell) {
        Fire.getSavePath = function (defaultFilename, persistDirKey, callback, title, browserWindow) {
            var defaultDir = localStorage[persistDirKey];
            var defaultPath = null;
            if (defaultDir && typeof defaultDir === 'string') {
                defaultDir = Fire.Path.dirname(defaultDir);
                defaultPath = Fire.Path.join(defaultDir, defaultFilename);
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
                    localStorage[persistDirKey] = path;
                }
                callback(path);
            });
        };
        var shell = require('shell');
        Fire.showItemInFolder = shell.showItemInFolder;
    }*/
}
else {
    var error = function () {
        throw new Error("This function can only be used in node-webkit or atom-shell");
    };
    Fire.getSavePath = error;
    Fire.showItemInFolder = error;
}
