//

if (FIRE.isNode) {
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
}

if (FIRE.isApp && FIRE.isWeb) {
    if (FIRE.isNw) {
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

            //chooser.addEventListener("change", function (evt) {
            //    console.log('change');
            //}, false);
            //chooser.addEventListener("blur", function (evt) {
            //    console.log('blur');
            //}, false);
            //chooser.addEventListener("load", function (evt) {
            //    console.log('load');
            //}, false);
            //chooser.addEventListener("unload", function (evt) {
            //    console.log('unload');
            //}, false);
            //chooser.addEventListener("abort", function (evt) {
            //    console.log('abort');
            //}, false);
            //chooser.addEventListener("click", function (evt) {
            //    console.log('click');
            //}, false);
            //chooser.addEventListener("error", function (evt) {
            //    console.log('error');
            //}, false);
            //chooser.addEventListener("resize", function (evt) {
            //    console.log('resize');
            //}, false);
            //chooser.addEventListener("select", function (evt) {
            //    console.log('select');
            //}, false);
            //chooser.addEventListener("submit", function (evt) {
            //    console.log('submit');
            //}, false);
            //chooser.addEventListener("reset", function (evt) {
            //    console.log('reset');
            //}, false);
            //chooser.addEventListener("focus", function (evt) {
            //    console.log('focus');
            //}, false);
            //chooser.addEventListener("focusin", function (evt) {
            //    console.log('focusin');
            //}, false);
            //chooser.addEventListener("focusout", function (evt) {
            //    console.log('focusout');
            //}, false);
            //chooser.addEventListener("error", function (evt) {
            //    console.log('error');
            //}, false);


            //chooser.addEventListener("change", function (evt) {
            //    console.log('change');
            //}, true);
            //chooser.addEventListener("blur", function (evt) {
            //    console.log('blur');
            //}, true);
            //chooser.addEventListener("load", function (evt) {
            //    console.log('load');
            //}, true);
            //chooser.addEventListener("unload", function (evt) {
            //    console.log('unload');
            //}, true);
            //chooser.addEventListener("abort", function (evt) {
            //    console.log('abort');
            //}, true);
            //chooser.addEventListener("click", function (evt) {
            //    console.log('click');
            //}, true);
            //chooser.addEventListener("error", function (evt) {
            //    console.log('error');
            //}, true);
            //chooser.addEventListener("resize", function (evt) {
            //    console.log('resize');
            //}, true);
            //chooser.addEventListener("select", function (evt) {
            //    console.log('select');
            //}, true);
            //chooser.addEventListener("submit", function (evt) {
            //    console.log('submit');
            //}, true);
            //chooser.addEventListener("reset", function (evt) {
            //    console.log('reset');
            //}, true);
            //chooser.addEventListener("focus", function (evt) {
            //    console.log('focus');
            //}, true);
            //chooser.addEventListener("focusin", function (evt) {
            //    console.log('focusin');
            //}, true);
            //chooser.addEventListener("focusout", function (evt) {
            //    console.log('focusout');
            //}, true);
            //chooser.addEventListener("error", function (evt) {
            //    console.log('error');
            //}, true);
            chooser.click();
            //chooser.value = '';
            //chooser.files = new FileList();
            //chooser.files.append(new File('',''));
            //chooser.files = null;
        };
        var nwgui = require('nw.gui');
        FIRE.showItemInFolder = nwgui.Shell.showItemInFolder;
    }
    /*else if (FIRE.isAs) {
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
    }*/
}
else {
    var error = function () {
        throw "This function can only be used in node-webkit or atom-shell";
    };
    FIRE.getSavePath = error;
    FIRE.showItemInFolder = error;
}