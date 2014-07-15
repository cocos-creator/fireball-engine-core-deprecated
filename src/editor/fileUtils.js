//
FIRE.savePng = function (canvas, basename, path, pixelBuffer) {
    if (typeof(libpng) !== 'undefined') {
        // encode by libpng
        console.time('libpng encode ' + basename);
        var png = libpng.createWriter(canvas.width, canvas.height);
        png.set_filter(libpng.FILTER_NONE);
        png.set_compression_level(3);
        png.write_imageData(pixelBuffer);
        png.write_end();
        console.timeEnd('libpng encode ' + basename);
        //console.log('Bytes: ' + png.data.length);
        if (FIRE.isnode) {
            Fs.writeFileSync(path, new Buffer(png.data));   //, {'encoding': 'base64'}
        }
        else {
            var blob = new Blob([new Uint8Array(png.data)], {type: 'image/png'});
            FIRE.downloadBlob(blob, basename + '.png');
        }
    }
    else {  // encode by canvas
        if (FIRE.isnode) {
            var dataUrl = canvas.toDataURL('image/png');
            FIRE.saveDataUrl(dataUrl, path);
        }
        else {
            FIRE.downloadCanvas(canvas, basename + '.png');
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
