FIRE.getTrimRect = function (img, trimThreshold) {
    // create temp canvas
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage( img, 0, 0, img.width, img.height );  
    var pixels = ctx.getImageData(0, 0, img.width, img.height).data;

    //
    var xmin = img.width;
    var xmax = 0;
    var ymin = img.height;
    var ymax = 0;

    var x_start = 0;
    var x_end = img.width;
    var y_start = 0;
    var y_end = img.height;
    var x = -1;
    var y = -1;

    for ( x = x_start; x < x_end; ++x ) {
        for ( y = y_start; y < y_end; ++y ) {
            if ( pixels[(x+y*img.width)*4+3] >= trimThreshold ) {
                xmin = x;
                x = img.width;
                break;
            }
        }
    }

    for ( x = x_end-1; x >= x_start; --x ) {
        for ( y = y_start; y < y_end; ++y ) {
            if ( pixels[(x+y*img.width)*4+3] >= trimThreshold ) {
                xmax = x;
                x = -1;
                break;
            }
        }
    }

    for ( y = y_start; y < y_end; ++y ) {
        for ( x = x_start; x < x_end; ++x ) {
            if ( pixels[(x+y*img.width)*4+3] >= trimThreshold ) {
                ymin = y;
                y = img.height;
                break;
            }
        }
    }

    for ( y = y_end-1; y >= y_start; --y ) {
        for ( x = x_start; x < x_end; ++x ) {
            if ( pixels[(x+y*img.width)*4+3] >= trimThreshold ) {
                ymax = y;
                y = -1;
                break;
            }
        }
    }

    var newWidth  = (xmax - xmin) + 1;
    var newHeight = (ymax - ymin) + 1;
    return new FIRE.Rect(xmin, ymin, newWidth, newHeight);
};

// modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class
var getClassName = function (obj) {
    if (obj && obj.constructor) {
        //  for browsers which have name property in the constructor of the object, such as chrome 
        if (obj.constructor.name) {
            return obj.constructor.name;
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
                return arr[1];
            }
        }
    }
    return undefined;
};