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

FIRE.getFirstFocusableChild = function ( element ) {
    if ( element.tabIndex !== null && 
         element.tabIndex !== undefined &&
         element.tabIndex !== -1 )
    {
        return element;
    }

    var el = null;
    for ( var i = 0; i < element.children.length; ++i ) {
        el = FIRE.getFirstFocusableChild(element.children[i]);
        if ( el !== null )
            return el;
    }
    if ( element.shadowRoot ) {
        el = FIRE.getFirstFocusableChild(element.shadowRoot);
        if ( el !== null )
            return el;
    }

    return null;
};

//
FIRE.getTrimRect = function (img, trimThreshold) {
    var canvas, ctx;
    if (img instanceof Image || img instanceof HTMLImageElement) {
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
    var pixelBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // get trim
    return _doGetTrimRect(pixelBuffer, img.width, img.height, trimThreshold);
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
        if ( _dragGhost.parentNode !== null ) {
            _dragGhost.parentNode.removeChild(_dragGhost);
        }
    }
};

var _readDir = function (dirReader, callback) {
    var onReadDir = function (entries) {
        if (!entries.length) {
            return; // readed
        }
        else {
            // recursive directory read
            _readEntries(entries, callback);

            // Keep calling readEntries() until no more results are returned.
            // This is needed to get all directory entries as one 
            // call of readEntries may not return all items. Works a 
            // bit like stream reader.
            _readDir(dirReader, callback);
        }
    };
    dirReader.readEntries(onReadDir);
};
// Recursive directory read 
var _readEntries = function (entries, callback) {
    var files = [];
    var processingFile = 0;
    var onLoadFile = function (file) {
        --processingFile;
        files.push(file);
        if (processingFile === 0) {
            callback(files);
        }
    };
    var dirReader;
    for (var i = 0; i < entries.length; i++) {
        if (entries[i].isDirectory) {
            dirReader = entries[i].createReader();
            _readDir(dirReader, callback);
        }
        else {
            ++processingFile;
            entries[i].file(onLoadFile);
        }
    }
};

// 获得浏览器拖进来的文件，当包含文件夹时，callback将被多次调用
// recursive read all the files and (sub-)folders which dragged and dropped to browser
FIRE.getDraggingFiles = function (event, callback) {
    //var paths = [];
    //for (var i = 0; i < files.length; i++) {
    //    paths.push(files[i].path);
    //}
    //files = FIRE.readDirRecursively(paths);
    var items = event.dataTransfer.items;
    if (!items) {
        callback(event.dataTransfer.files);
        return;
    }
    var files = [];
    var entry;
    for (var i = 0; i < items.length; i++) {
        if (items[i].getAsEntry) {
            entry = items[i].getAsEntry();
        }
        else if (items[i].webkitGetAsEntry) {
            entry = items[i].webkitGetAsEntry();
        }
        else {
            entry = null;
        }
        if (entry !== null && entry.isDirectory) {
            _readEntries([entry], callback);
        }
        else {
            files.push(event.dataTransfer.files[i]);
        }
    }
    if (files.length > 0) {
        callback(files);
    }
};