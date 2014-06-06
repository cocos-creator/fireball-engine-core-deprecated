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

// r, g, b must be [0.0, 1.0]
FIRE.rgb2hsv = function ( r, g, b ) {
    var hsv = { h: 0, s: 0, v: 0 }, min = 0, max = 0, delta;
    if (r >= g && r >= b) {
        max = r;
        min = g > b ? b : g;
    }
    else if (g >= b && g >= r) {
        max = g;
        min = r > b ? b : r;
    }
    else {
        max = b;
        min = g > r ? r : g;
    }
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) hsv.h = 0;
    else {
        delta = max - min;
        if (r == max) hsv.h = (g - b) / delta;
        else if (g == max) hsv.h = 2 + (b - r) / delta;
        else hsv.h = 4 + (r - g) / delta;
        hsv.h /= 6;
        if (hsv.h < 0) hsv.h += 1.0;
    }
    return hsv;
};

// the return rgb will be in [0.0, 1.0]
FIRE.hsv2rgb = function ( h, s, v ) {
    var rgb = { r: 0, g: 0, b: 0 };
    if (s === 0) {
        rgb.r = rgb.g = rgb.b = v;
    }
    else {
        if (v === 0) {
            rgb.r = rgb.g = rgb.b = 0;
        }
        else {
            if (h === 1) h = 0;
            h *= 6;
            s = s;
            v = v;
            var i = Math.floor(h);
            var f = h - i;
            var p = v * (1 - s);
            var q = v * (1 - (s * f));
            var t = v * (1 - (s * (1 - f)));
            switch (i) {
                case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;

                case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;

                case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;

                case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;

                case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;

                case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
            }
        }
    }
    return rgb;
};
