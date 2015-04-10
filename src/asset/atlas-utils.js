var AtlasUtils = {};

// ==================
// AtlasUtils.layout
// ==================

var _basicLayout = function (atlas, padding) {
    var curX = 0;
    var curY = 0;
    var maxY = 0;

    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        if ( curX + sprite.rotatedWidth > atlas.width ) {
            curX = 0;
            curY = curY + maxY + padding;
            maxY = 0;
        }
        if ( curY + sprite.rotatedHeight > atlas.height ) {
            throw new Error("Warning: Failed to layout element " + sprite.name);
        }
        sprite.x = curX;
        sprite.y = curY;

        curX = curX + sprite.rotatedWidth + padding;
        if ( sprite.rotatedHeight > maxY ) {
            maxY = sprite.rotatedHeight;
        }
    }
};

//
var _insertNode = function ( node, sprite, padding, allowRotate ) {
    // when this node is already occupied (when it has children),
    // forward to child nodes recursively
    if ( node.right !== null ) {
        var pos = _insertNode( node.right, sprite, padding, allowRotate );
        if ( pos !== null )
            return pos;
        return _insertNode( node.bottom, sprite, padding, allowRotate );
    }

    // determine trimmed and padded sizes
    var elWidth = sprite.rotatedWidth;
    var elHeight = sprite.rotatedHeight;
    var paddedWidth = elWidth + padding;
    var paddedHeight = elHeight + padding;
    var rect = node.rect;

    // trimmed element size must fit within current node rect
    if ( elWidth > rect.width || elHeight > rect.height ) {

        if ( allowRotate === false )
            return null;

        if ( elHeight > rect.width || elWidth > rect.height ) {
            return null;
        }
        else {
            sprite.rotated = !sprite.rotated;
            elWidth = sprite.rotatedWidth;
            elHeight = sprite.rotatedHeight;
            paddedWidth = elWidth + padding;
            paddedHeight = elHeight + padding;
        }
    }

    // create first child node in remaining space to the right, using elHeight
    // so that only other elements with the same height or less can be added there
    // (we do not use paddedHeight, because the padding area is reserved and should
    // never be occupied)
    node.right = {
        rect: new Fire.Rect (
            rect.x + paddedWidth,
            rect.y,
            rect.width - paddedWidth,
            elHeight
        ),
        right: null,
        bottom: null,
    };

    // create second child node in remaining space at the bottom, occupying the entire width
    node.bottom = {
        rect: new Fire.Rect (
            rect.x,
            rect.y + paddedHeight,
            rect.width,
            rect.height - paddedHeight
        ),
        right: null,
        bottom: null,
    };

    // return position where to put element
    return [ rect.x, rect.y ];
};
var _treeLayout = function (atlas, padding, allowRotate ) {
    var root = {
        rect: new Fire.Rect(
            0,
            0,
            atlas.width,
            atlas.height ),
        right: null,
        bottom: null,
    };
    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        var pos = _insertNode ( root, sprite, padding, allowRotate );
        if ( pos !== null ) {
            sprite.x = pos[0];
            sprite.y = pos[1];
        }
        else {
            // log warning but continue processing other elements
            throw new Error("Warning: Failed to layout element " + sprite.name);
        }
    }
};

var _splitFreeNode = function ( freeRects, freeNode, usedNode ) {
    // Test with SAT if the rectangles even intersect.
    if ( usedNode.x >= freeNode.x + freeNode.width || usedNode.x + usedNode.width <= freeNode.x ||
         usedNode.y >= freeNode.y + freeNode.height || usedNode.y + usedNode.height <= freeNode.y )
        return false;

    var newNode;
    if ( usedNode.x < freeNode.x + freeNode.width && usedNode.x + usedNode.width > freeNode.x ) {
        // New node at the top side of the used node.
        if ( usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.height ) {
            newNode = freeNode.clone();
            newNode.height = usedNode.y - newNode.y;
            freeRects.push(newNode);
        }
        // New node at the bottom side of the used node.
        if ( usedNode.y + usedNode.height < freeNode.y + freeNode.height ) {
            newNode = freeNode.clone();
            newNode.y = usedNode.y + usedNode.height;
            newNode.height = freeNode.y + freeNode.height - (usedNode.y + usedNode.height);
            freeRects.push(newNode);
        }
    }
    if ( usedNode.y < freeNode.y + freeNode.height && usedNode.y + usedNode.height > freeNode.y ) {
        // New node at the left side of the used node.
        if ( usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.width ) {
            newNode = freeNode.clone();
            newNode.width = usedNode.x - newNode.x;
            freeRects.push(newNode);
        }
        // New node at the right side of the used node.
        if ( usedNode.x + usedNode.width < freeNode.x + freeNode.width ) {
            newNode = freeNode.clone();
            newNode.x = usedNode.x + usedNode.width;
            newNode.width = freeNode.x + freeNode.width - (usedNode.x + usedNode.width);
            freeRects.push(newNode);
        }
    }

    return true;
};

var _placeRect = function ( freeRects, rect ) {
    var i;
    for ( i = 0; i < freeRects.length; ++i ) {
        if ( _splitFreeNode( freeRects, freeRects[i], rect ) ) {
            freeRects.splice(i, 1);
            --i;
        }
    }
    // cleanUpFreeRects
    for ( i = 0; i < freeRects.length; ++i ) {
        for ( var j = i + 1; j < freeRects.length; ++j ) {
            if ( freeRects[j].containsRect(freeRects[i]) ) {
                freeRects.splice(i, 1);
                --i;
                break;
            }
            if ( freeRects[i].containsRect(freeRects[j]) ) {
                freeRects.splice(j, 1);
                --j;
            }
        }
    }
};

//
var _maxRectLayout = function (atlas, padding, allowRotate) {
    var freeRects = [];
    freeRects.push ( new Fire.Rect( 0, 0, atlas.width + padding, atlas.height + padding ) );
    var score1, scroe2;
    var scoreRect = function (_freeRects, _width, _height, _allowRotate) {
        score1 = Number.MAX_VALUE;
        score2 = Number.MAX_VALUE;
        var newRect = new Fire.Rect(0, 0, 1, 1);
        var found = false;

        //
        for (var i = 0; i < _freeRects.length; ++i) {
            var freeRect = _freeRects[i];

            var leftoverHoriz, leftoverVert, shortSideFit, longSideFit;
            //
            if (freeRect.width >= _width && freeRect.height >= _height) {
                leftoverHoriz = Math.abs(Math.floor(freeRect.width) - _width);
                leftoverVert = Math.abs(Math.floor(freeRect.height) - _height);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                    newRect.x = freeRect.x;
                    newRect.y = freeRect.y;
                    newRect.width = _width;
                    newRect.height = _height;
                    score1 = shortSideFit;
                    score2 = longSideFit;

                    found = true;
                }
            }

            // rotated
            if (_allowRotate && freeRect.width >= _height && freeRect.height >= _width) {
                leftoverHoriz = Math.abs(Math.floor(freeRect.width) - _height);
                leftoverVert = Math.abs(Math.floor(freeRect.height) - _width);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);

                if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                    newRect.x = freeRect.x;
                    newRect.y = freeRect.y;
                    newRect.width = _height;
                    newRect.height = _width;
                    score1 = shortSideFit;
                    score2 = longSideFit;

                    found = true;
                }
            }
        }

        //
        if (found === false) {
            score1 = Number.MAX_VALUE;
            score2 = Number.MAX_VALUE;
        }

        return newRect;
    };

    var processElements = atlas.sprites.slice();   // clone
    while ( processElements.length > 0 ) {
        var bestScore1 = Number.MAX_VALUE;
        var bestScore2 = Number.MAX_VALUE;
        var bestElementIdx = -1;
        var bestRect = new Fire.Rect( 0, 0, 1, 1 );

        for ( var i = 0; i < processElements.length; ++i ) {
            var newRect = scoreRect ( freeRects,
                                      processElements[i].width + padding,
                                      processElements[i].height + padding,
                                      allowRotate );

            if ( score1 < bestScore1 || (score1 === bestScore1 && score2 < bestScore2) ) {
                bestScore1 = score1;
                bestScore2 = score2;
                bestRect = newRect;
                bestElementIdx = i;
            }
        }

        if ( bestElementIdx === -1 ) {
            throw new Error( "Error: Failed to layout atlas element" );
        }

        _placeRect( freeRects, bestRect );

        // apply the best-element
        var bestElement = processElements[bestElementIdx];
        bestElement.x = Math.floor(bestRect.x);
        bestElement.y = Math.floor(bestRect.y);
        bestElement.rotated = (bestElement.width + padding !== bestRect.width);
        // remove the processed(inserted) element
        processElements.splice( bestElementIdx, 1 );
    }
};

AtlasUtils.layout = function ( atlas, algorithm, autoSize, padding, allowRotate ) {
    try {
        switch ( algorithm ) {
            case Fire.Atlas.Algorithm.Basic:
                _basicLayout(atlas, padding);
            break;

            case Fire.Atlas.Algorithm.Tree:
                _treeLayout(atlas, padding, allowRotate );
            break;

            case Fire.Atlas.Algorithm.MaxRect:
                _maxRectLayout(atlas, padding, allowRotate);
            break;
        }
    }
    catch ( err ) {
        if ( autoSize === false ) {
            Fire.error(err.message);
            return;
        }

        if ( atlas.width === 4096 && atlas.height === 4096 ) {
            Fire.error(err.message);
            return;
        }

        if ( atlas.width === atlas.height ) {
            atlas.width *= 2;
        }
        else {
            atlas.height = atlas.width;
        }
        AtlasUtils.layout( atlas, algorithm, autoSize, padding, allowRotate );
    }
};

// ==================
// AtlasUtils.sort
// ==================

//
var _compareByWidth = function (a,b) {
    var ret = a.width - b.width;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByHeight = function (a,b) {
    var ret = a.height - b.height;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByArea = function (a,b) {
    var ret = a.width * a.height - b.width * b.height;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByName = function (a,b) {
    return a.name.localeCompare( b.name );
};
var _compareByRotateWidth = function (a,b) {
    var a_size = a.width;
    if ( a.height > a.width ) {
        a_size = a.height;
        a.rotated = true;
    }
    var b_size = b.width;
    if ( b.height > b.width ) {
        b_size = b.height;
        b.rotated = true;
    }
    var ret = a_size - b_size;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};
var _compareByRotateHeight = function (a,b) {
    var a_size = a.height;
    if ( a.width > a.height ) {
        a_size = a.width;
        a.rotated = true;
    }
    var b_size = b.height;
    if ( b.width > b.height ) {
        b_size = b.width;
        b.rotated = true;
    }
    var ret = a_size - b_size;
    if ( ret === 0 ) {
        ret = a.name.localeCompare( b.name );
    }
    return ret;
};

AtlasUtils.sort = function ( atlas, algorithm, sortBy, sortOrder, allowRotate ) {
    // reset rotation
    for (var i = 0; i < atlas.sprites.length; ++i) {
        var sprite = atlas.sprites[i];
        sprite.rotated = false;
    }
    //
    var mySortBy = sortBy;
    var mySortOrder = sortOrder;
    if ( mySortBy === Fire.Atlas.SortBy.UseBest ) {
        switch ( algorithm ) {
        case Fire.Atlas.Algorithm.Basic:
            mySortBy = Fire.Atlas.SortBy.Height;
            break;

        case Fire.Atlas.Algorithm.Tree:
            mySortBy = Fire.Atlas.SortBy.Area;
            break;

        case Fire.Atlas.Algorithm.MaxRect:
            mySortBy = Fire.Atlas.SortBy.Area;
            break;

        default:
            mySortBy = Fire.Atlas.SortBy.Height;
            break;
        }
    }
    if ( mySortOrder === Fire.Atlas.SortOrder.UseBest ) {
        mySortOrder = Fire.Atlas.SortOrder.Descending;
    }

    //
    switch ( mySortBy ) {
        case Fire.Atlas.SortBy.Width:
            if ( allowRotate )
                atlas.sprites.sort( _compareByRotateWidth );
            else
                atlas.sprites.sort( _compareByWidth );
            break;

        case Fire.Atlas.SortBy.Height:
            if ( allowRotate )
                atlas.sprites.sort( _compareByRotateHeight );
            else
                atlas.sprites.sort( _compareByHeight );
            break;

        case Fire.Atlas.SortBy.Area:
            atlas.sprites.sort( _compareByArea );
            break;

        case Fire.Atlas.SortBy.Name:
            atlas.sprites.sort( _compareByName );
            break;
    }

    // sort order
    if ( mySortOrder === Fire.Atlas.SortOrder.Descending ) {
        atlas.sprites.reverse();
    }
};

Editor.AtlasUtils = AtlasUtils;
