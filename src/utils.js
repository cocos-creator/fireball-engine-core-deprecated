var _doGetTrimRect = function (pixels, w, h, trimThreshold) {
    // A B C
    // D x F
    // G H I

    var tx = w, ty = h,
        tw = 0, th = 0,
        ditch = w * 4;

    var x, y, i;
    var index;  // alpha index in pixels

    // trim A B C
    for (y = 0; y < h; y++) {
        index = y * ditch + 3;  // (x + y * w) * 4 + 3
        for (x = 0; x < w; x++, index += 4) {
            if (pixels[index] >= trimThreshold) {
                ty = y;
                y = h;
                break;
            }
        }
    }
    // trim G H I
    for (y = h - 1; y >= ty; y--) {
        index = y * ditch + 3;
        for (x = 0; x < w; x++, index += 4) {
            if (pixels[index] >= trimThreshold) {
                th = y - ty + 1;
                y = 0;
                break;
            }
        }
    }
    var skipTrimmedY = ditch * ty;   // skip A B C
    // trim D
    for (x = 0; x < w; x++) {
        index = skipTrimmedY + x * 4 + 3;
        for (i = 0; i < th; i++, index += ditch) {
            if (pixels[index] >= trimThreshold) {
                tx = x;
                x = w;
                break;
            }
        }
    }
    // trim F
    for (x = w - 1; x >= tx; x--) {
        index = skipTrimmedY + x * 4 + 3;
        for (i = 0; i < th; i++, index += ditch) {
            if (pixels[index] >= trimThreshold) {
                tw = x - tx + 1;
                x = 0;
                break;
            }
        }
    }

    return new FIRE.Rect(tx, ty, tw, th);
};

FIRE.getTrimRect = function (img, trimThreshold) {
    // create temp canvas
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage( img, 0, 0, img.width, img.height );  
    var pixels = ctx.getImageData(0, 0, img.width, img.height).data;

    // get trim
    return _doGetTrimRect(pixels, img.width, img.height, trimThreshold);
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null
 * modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class
 * @return {String}
 */
FIRE.getClassName = function (obj) {
    if (obj && obj.constructor) {
        var retval;
        //  for browsers which have name property in the constructor of the object, such as chrome 
        if (obj.constructor.name) {
            retval = obj.constructor.name;
        }
        if (obj.constructor.toString) {
            var arr, str = obj.constructor.toString();
            if (str.charAt(0) == '[') {
                // str is "[object objectClass]"
                arr = str.match(/\[\w+\s*(\w+)\]/);
            }
            else {
                // str is function objectClass () {} for IE Firefox
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length == 2) {
                retval = arr[1];
            }
        }
        return retval !== 'Object' ? retval : null;
    }
    return null;
};
