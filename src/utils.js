/**
 * @method padLeft
 * @param {string} text
 * @param {number} width
 * @param {string} ch - the character used to pad
 * @return {string}
 */
Fire.padLeft = function ( text, width, ch ) {
    text = text.toString();
    width -= text.length;
    if ( width > 0 ) {
        return new Array( width + 1 ).join(ch) + text;
    }
    return text;
};

/**
 * @method fitRatio
 * @param {number} ratio - width / height
 * @param {number} destWidth
 * @param {number} destHeight
 * @return {array}
 */
Fire.fitRatio = function ( ratio, destWidth, destHeight ) {
    var srcWidth, srcHeight;
    if ( ratio > 1 ) {
        srcWidth = destWidth;
        srcHeight = srcWidth / ratio;
    }
    else {
        srcHeight = destHeight;
        srcWidth = srcHeight * ratio;
    }
    return Fire.fitSize( srcWidth, srcHeight, destWidth, destHeight );
};

/**
 * @method fitSize
 * @param {number} srcWidth
 * @param {number} srcHeight
 * @param {number} destWidth
 * @param {number} destHeight
 * @return {number[]} - [width, height]
 */
Fire.fitSize = function ( srcWidth, srcHeight, destWidth, destHeight ) {
    var width, height;
    if ( srcWidth > destWidth &&
         srcHeight > destHeight )
    {
        width = destWidth;
        height = srcHeight * destWidth/srcWidth;

        if ( height > destHeight ) {
            height = destHeight;
            width = srcWidth * destHeight/srcHeight;
        }
    }
    else if ( srcWidth > destWidth ) {
        width = destWidth;
        height = srcHeight * destWidth/srcWidth;
    }
    else if ( srcHeight > destHeight ) {
        width = srcWidth * destHeight/srcHeight;
        height = destHeight;
    }
    else {
        width = srcWidth;
        height = srcHeight;
    }

    return [width,height];
};

/**
 * @method getEnumList
 * @param {object} enumDef - the enum type defined from Fire.defineEnum
 * @return {object[]}
 * @private
 */
Fire.getEnumList = function (enumDef) {
    if ( enumDef.__enums__ !== undefined )
        return enumDef.__enums__;

    var enums = [];
    for ( var entry in enumDef ) {
        if ( enumDef.hasOwnProperty(entry) ) {
            var value = enumDef[entry];
            var isInteger = typeof value === 'number' && (value | 0) === value; // polyfill Number.isInteger
            if ( isInteger ) {
                enums.push( { name: entry, value: value } );
            }
        }
    }
    enums.sort( function ( a, b ) { return a.value - b.value; } );

    enumDef.__enums__ = enums;
    return enums;
};

/**
 * @method getVarFrom
 * @param {object} obj
 * @param {string} text
 * @return {any}
 * @private
 */
Fire.getVarFrom = function ( obj, text ) {
    var res = text.split('.');
    var curObj = obj;
    for ( var i = 0; i < res.length; ++i ) {
        var name = res[i];
        curObj = curObj[name];
        if ( curObj === undefined || curObj === null )
            return null;
    }
    return curObj;
};

/**
 * @method rgb2hsv
 * @param {number} r - red, must be [0.0, 1.0]
 * @param {number} g - red, must be [0.0, 1.0]
 * @param {number} b - red, must be [0.0, 1.0]
 * @return {object} - {h: number, s: number, v: number}
 */
Fire.rgb2hsv = function ( r, g, b ) {
    var hsv = { h: 0, s: 0, v: 0 };
    var max = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    var delta = 0;
    hsv.v = max;
    hsv.s = max ? (max - min) / max : 0;
    if (!hsv.s) hsv.h = 0;
    else {
        delta = max - min;
        if (r === max) hsv.h = (g - b) / delta;
        else if (g === max) hsv.h = 2 + (b - r) / delta;
        else hsv.h = 4 + (r - g) / delta;
        hsv.h /= 6;
        if (hsv.h < 0) hsv.h += 1.0;
    }
    return hsv;
};

/**
 * @method hsv2rgb
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @return {object} - {r: number, g: number, b: number}}, rgb will be in [0.0, 1.0]
 */
Fire.hsv2rgb = function ( h, s, v ) {
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

/**
 * Searches the entire sorted Array for an element and returns the zero-based index of the element.
 * @method binarySearch
 * @param {number[]} array
 * @param {number} value
 * @return {number} The zero-based index of item in the sorted Array, if item is found; otherwise, a negative number that is the bitwise complement of the index of the next element that is larger than item or, if there is no larger element, the bitwise complement of array's length.
 */
Fire.binarySearch = function(array, value) {
    var l = 0, h = array.length - 1;
    while (l <= h) {
        var m = ((l + h) >> 1);
        if (array[m] === value) {
            return m;
        }
        if (array[m] > value) {
            h = m - 1;
        }
        else {
            l = m + 1;
        }
    }
    return ~l;
};

function _isDomNode(obj) {
    return (
        typeof Node === "object" ? obj instanceof Node :
        obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
    );
}

// @ifdef DEV
/**
 * @param {object} obj
 * @return {boolean} is {} ?
 */
var _isPlainEmptyObj_DEV = function (obj) {
    if (!obj || obj.constructor !== ({}).constructor) {
        return false;
    }
    // jshint ignore: start
    for (var k in obj) {
        return false;
    }
    // jshint ignore: end
    return true;
};
// @endif

// @ifdef DEV
var _cloneable_DEV = function (obj) {
    return obj && typeof obj.clone === 'function' && (obj.constructor.prototype.hasOwnProperty('clone') || obj.hasOwnProperty('clone'));
};
// @endif
