//
//var hasLibPng

FIRE.savePng = function (canvas, filename, path, pixelBuffer, callback) {
    function getLibpng(callback) {
        if (typeof(libpng) !== 'undefined') {
            callback(libpng);
            return true;
        }
        else if (FIRE.isnode === false && require) {
            require(['libpng'], callback);
            return true;
        }
        return false;
    }
    
    var usingLibpng = getLibpng(function (libpng) {
        // encode by libpng
        console.time('libpng encode ' + filename);
        var png = libpng.createWriter(canvas.width, canvas.height);
        png.set_filter(libpng.FILTER_NONE);
        png.set_compression_level(3);
        png.write_imageData(pixelBuffer);
        png.write_end();
        console.timeEnd('libpng encode ' + filename);
        //console.log('Bytes: ' + png.data.length);
        if (FIRE.isnode) {
            Fs.writeFileSync(path, new Buffer(png.data));   //, {'encoding': 'base64'}
        }
        else {
            var blob = new Blob([new Uint8Array(png.data)], {type: 'image/png'});
            FIRE.downloadBlob(blob, filename);
        }
        if (callback) {
            callback();
        }
    });
    if (usingLibpng === false) {
        if (!canvas) {
            throw 'no png encoder nor canvas';
        }
        // encode by canvas
        if (FIRE.isnode) {
            var dataUrl = canvas.toDataURL('image/png');
            FIRE.saveDataUrl(dataUrl, path);
        }
        else {
            FIRE.downloadCanvas(canvas, filename);
        }
        if (callback) {
            callback();
        }
    }
};

FIRE.saveText = function (text, filename, path) {
    if (FIRE.isnode) {
        Fs.writeFileSync(path, text, {'encoding': 'ascii'});
    }
    else {
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});    // not support 'application/json'
        FIRE.downloadBlob(blob, filename);
    }
};
