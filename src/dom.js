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
FIRE.getParentTabIndex = function ( element ) {
    var parent = element.parentElement;
    while ( parent ) {
        if ( parent.tabIndex !== null && 
             parent.tabIndex !== undefined &&
             parent.tabIndex !== -1 )
            return parent.tabIndex;

        parent = parent.parentElement;
    }
    return 0;
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

var _dragGhost = null; 
FIRE.addDragGhost = function ( cursor ) {
    // add drag-ghost
    if ( _dragGhost === null ) {
        _dragGhost = document.createElement('div');
        _dragGhost.classList.add('drag-ghost');
        _dragGhost.style.position = 'fixed';
        _dragGhost.style.zIndex = '999';
        _dragGhost.style.left = '0';
        _dragGhost.style.top = '0';
        _dragGhost.style.width = window.innerWidth + 'px';
        _dragGhost.style.height = window.innerHeight + 'px';
        _dragGhost.oncontextmenu = function() { return false; };
    }
    _dragGhost.style.cursor = cursor;
    document.body.appendChild(_dragGhost);
};

FIRE.removeDragGhost = function () {
    if ( _dragGhost !== null ) {
        _dragGhost.style.cursor = 'auto';
        _dragGhost.parentNode.removeChild(_dragGhost);
    }
};
