//
//var hasLibPng

FIRE.savePng = function (canvas, filename, path, pixelBuffer, zip, callback) {
    function getLibpng(callback) {
        if (typeof(libpng) !== 'undefined') {
            callback(libpng);
            return true;
        }
        else if (requirejs) {
            requirejs(['libpng'], callback);
            return true;
        }
        return false;
    }
    
    var usingLibpng = getLibpng(function (libpng) {
        // encode by libpng
        console.time('png ' + filename);
        var png = libpng.createWriter(canvas.width, canvas.height);
        png.set_filter(libpng.FILTER_NONE);
        png.set_compression_level(3);
        png.write_imageData(pixelBuffer);
        png.write_end();
        console.timeEnd('png ' + filename);
        //console.log('Bytes: ' + png.data.length);
        if (FIRE.isnode) {
            if (zip) {
                zip.file(filename, png.data);   // TODO: test
            }
            else {
                Fs.writeFileSync(path, new Buffer(png.data));   //, {'encoding': 'base64'}
            }
        }
        else {
            if (zip) {
                zip.file(filename, png.data);
            }
            else {
                var blob = new Blob([new Uint8Array(png.data)], {type: 'image/png'});
                FIRE.downloadBlob(blob, filename);
            }
        }
        if (callback) {
            callback();
        }
    });
    if (usingLibpng === false) {
        var dataUrl, base64;
        if (!canvas) {
            throw 'no png encoder nor canvas';
        }
        // encode by canvas
        if (FIRE.isnode) {
            dataUrl = canvas.toDataURL('image/png');
            base64 = FIRE.imgDataUrlToBase64(dataUrl);
            if (zip) {
                zip.file(filename, base64, { base64: true });
            }
            else {
                Fs.writeFileSync(path, base64, {'encoding': 'base64'});
            }
        }
        else {
            if (zip) {
                dataUrl = canvas.toDataURL('image/png');
                base64 = FIRE.imgDataUrlToBase64(dataUrl);
                zip.file(filename, base64, { base64: true });
            }
            else {
                FIRE.downloadCanvas(canvas, filename);
            }
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
