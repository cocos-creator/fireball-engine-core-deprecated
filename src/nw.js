//
FIRE.isnw = (typeof(process) !== 'undefined' && process.versions && process.versions['node-webkit']);

//
FIRE.setExtension = function ( path, newExtension ) {
    if ( FIRE.isnw ) {
        var Path = require('path');
        return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path))) + newExtension;
    }

    console.warn("This function can only be used in node-webkit");
    return path;
};
