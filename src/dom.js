var _findInChildren = function ( element, elementToFind ) {
    for ( var i = 0; i < element.children.length; ++i ) {
        var childEL = element.children[i];
        if ( childEL === elementToFind )
            return true;

        if ( childEL.children.length > 0 )
            if ( _findInChildren( childEL, elementToFind ) )
                return true;
    }
    return false;
};


//
FIRE.find = function ( elements, elementToFind ) {
    if ( Array.isArray(elements) || 
         elements instanceof NodeList ||
         elements instanceof HTMLCollection ) 
    {
        for ( var i = 0; i < elements.length; ++i ) {
            var element = elements[i];
            if ( element === elementToFind )
                return true;

            if ( _findInChildren ( element, elementToFind ) )
                return true;
        }
        return false;
    }

    // if this is a single element
    if ( elements === elementToFind )
        return true;

    return _findInChildren( elements, elementToFind );
};

//
FIRE.getTrimRect = function (img, trimThreshold) {
    var canvas, ctx;
    if (img instanceof Image) {
        // create temp canvas
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage( img, 0, 0, img.width, img.height );  
    }
    else {
        canvas = img;
        ctx = canvas.getContext('2d');
    }
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // get trim
    return _doGetTrimRect(pixels, img.width, img.height, trimThreshold);
};
