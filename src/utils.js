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

