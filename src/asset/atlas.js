FIRE.Atlas = (function () {

    var Atlas = FIRE.define("FIRE.Atlas", FIRE.Asset, null);  // supply a null constructor to explicitly indicates that 
                                                              // inherit from Asset, because Asset not defined by FIRE.define

    // enum Algorithm
    Atlas.Algorithm = (function (t) {
        t[t.Basic   = 0] = 'Basic';
        t[t.Tree    = 1] = 'Tree';
        t[t.MaxRect = 2] = 'MaxRect';
        return t;
    })({});

    // enum SortBy
    Atlas.SortBy = (function (t) {
        t[t.UseBest = 0] = 'UseBest';
        t[t.Width   = 1] = 'Width';
        t[t.Height  = 2] = 'Height';
        t[t.Area    = 3] = 'Area';
        t[t.Name    = 4] = 'Name';
        return t;
    })({});

    // enum SortOrder
    Atlas.SortOrder = (function (t) {
        t[t.UseBest    = 0] = 'UseBest';
        t[t.Ascending  = 1] = 'Ascending';
        t[t.Descending = 2] = 'Descending';
        return t;
    })({});

    // basic settings
    Atlas.prop('autoSize', true);
    Atlas.prop('width', 512, FIRE.Integer, FIRE.Custom('Editor.SizeList') );
    Atlas.prop('height', 512, FIRE.Integer, FIRE.Custom('Editor.SizeList') );
    Atlas.prop('trim', true, FIRE.EditorOnly);
    Atlas.prop('trimThreshold', 1, FIRE.Integer, FIRE.EditorOnly);

    // layout settings
    Atlas.prop('algorithm', Atlas.Algorithm.MaxRect, FIRE.Enum(Atlas.Algorithm), FIRE.EditorOnly);
    Atlas.prop('sortBy', Atlas.SortBy.UseBest, FIRE.Enum(Atlas.SortBy), FIRE.EditorOnly);
    Atlas.prop('sortOrder', Atlas.SortOrder.UseBest, FIRE.Enum(Atlas.SortOrder), FIRE.EditorOnly);
    Atlas.prop('allowRotate', true, FIRE.EditorOnly);
    
    // build settings
    Atlas.prop('useContourBleed', true, FIRE.DisplayName('Contour Bleed'),  // 应用于sprite内部，只改变全透明像素的颜色
                                        FIRE.EditorOnly,
                                        FIRE.Tooltip('reduce border artifacts'));
    
    Atlas.prop('usePaddingBleed', true, FIRE.DisplayName('Padding Bleed'),  // 应用于sprite外部，同时复制颜色和透明度
                                        FIRE.EditorOnly,
                                        FIRE.Tooltip('extrude'));
    Atlas.prop('customPadding', 2, FIRE.Integer, FIRE.EditorOnly);
    Atlas.prop('customBuildColor', false, FIRE.EditorOnly);
    Atlas.prop('buildColor', new FIRE.Color(1, 1, 1, 1), FIRE.EditorOnly);
    
    //
    Atlas.prototype.add = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var t = this.sprites[i];
            if ( t.name === sprite.name ) {
                this.sprites[i] = sprite;
                return;
            }
        }

        this.sprites.push(sprite);
    };

    // remove sprite 
    Atlas.prototype.remove = function ( sprite ) {
        var idx = this.sprites.indexOf(sprite);
        if ( idx !== -1 ) {
            this.sprites.splice(idx,1);
        }
    };

    // clear all sprites
    Atlas.prototype.clear = function () {
        this.sprites.length = 0;
    };

    //
    var _basicLayout = function (atlas) {
        var curX = 0; 
        var curY = 0; 
        var maxY = 0; 

        for (var i = 0; i < atlas.sprites.length; ++i) {
            var sprite = atlas.sprites[i];
            if ( curX + sprite.rotatedWidth > atlas.width ) {
                curX = 0;
                curY = curY + maxY + atlas.customPadding;
                maxY = 0;
            }
            if ( curY + sprite.rotatedHeight > atlas.height ) {
                throw new Error("Warning: Failed to layout element " + sprite.name);
            }
            sprite.x = curX;
            sprite.y = curY;

            curX = curX + sprite.rotatedWidth + atlas.customPadding;
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
            rect: new FIRE.Rect (
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
            rect: new FIRE.Rect ( 
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
    var _treeLayout = function (atlas) {
        var root = {
            rect: new FIRE.Rect( 
                0,
                0,
                atlas.width,
                atlas.height ), 
            right: null,
            bottom: null,
        };
        for (var i = 0; i < atlas.sprites.length; ++i) {
            var sprite = atlas.sprites[i];
            var pos = _insertNode ( root, sprite, atlas.customPadding, atlas.allowRotate );
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
                if ( FIRE.Rect.contains(freeRects[i], freeRects[j]) === -1 ) {
                    freeRects.splice(i, 1);
                    --i;
                    break;
                }
                if ( FIRE.Rect.contains(freeRects[j], freeRects[i]) === -1 ) {
                    freeRects.splice(j, 1);
                    --j;
                }
            }
        }
    };

    //
    var _maxRectLayout = function (atlas) {
        var freeRects = [];
        freeRects.push ( new FIRE.Rect( 0, 0, atlas.width + atlas.customPadding, atlas.height + atlas.customPadding ) );
        var score1/*, scroe2*/;
        var scoreRect = function (_freeRects, _width, _height, _allowRotate) {
            score1 = Number.MAX_VALUE;
            score2 = Number.MAX_VALUE;
            var newRect = new FIRE.Rect(0, 0, 1, 1);
            var found = false;

            //
            for (var i = 0; i < _freeRects.length; ++i) {
                var freeRect = _freeRects[i];

                var leftoverHoriz, leftoverVert, shortSideFit, longSideFit;
                //
                if (freeRect.width >= _width && freeRect.height >= _height) {
                    leftoverHoriz = Math.abs(Math.floor(_freeRects[i].width) - _width);
                    leftoverVert = Math.abs(Math.floor(_freeRects[i].height) - _height);
                    shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                    longSideFit = Math.max(leftoverHoriz, leftoverVert);

                    if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                        newRect.x = _freeRects[i].x;
                        newRect.y = _freeRects[i].y;
                        newRect.width = _width;
                        newRect.height = _height;
                        score1 = shortSideFit;
                        score2 = longSideFit;

                        found = true;
                    }
                }

                // rotated
                if (_allowRotate && freeRect.width >= _height && freeRect.height >= _width) {
                    leftoverHoriz = Math.abs(Math.floor(_freeRects[i].width) - _height);
                    leftoverVert = Math.abs(Math.floor(_freeRects[i].height) - _width);
                    shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                    longSideFit = Math.max(leftoverHoriz, leftoverVert);

                    if (shortSideFit < score1 || (shortSideFit === score1 && longSideFit < score2)) {
                        newRect.x = _freeRects[i].x;
                        newRect.y = _freeRects[i].y;
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
            var bestRect = new FIRE.Rect( 0, 0, 1, 1 );

            for ( var i = 0; i < processElements.length; ++i ) {
                var newRect = scoreRect ( freeRects, 
                                          processElements[i].width + atlas.customPadding, 
                                          processElements[i].height + atlas.customPadding, 
                                          atlas.allowRotate );

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
            bestElement.rotated = (bestElement.width + atlas.customPadding !== bestRect.width);
            // remove the processed(inserted) element
            processElements.splice( bestElementIdx, 1 );
        }
    };

    Atlas.prototype.layout = function () {
        try {
            switch ( this.algorithm ) {
                case Atlas.Algorithm.Basic:
                    _basicLayout(this);
                break;

                case Atlas.Algorithm.Tree:
                    _treeLayout(this);
                break;

                case Atlas.Algorithm.MaxRect:
                    _maxRectLayout(this);
                break;
            }
        }
        catch ( err ) {
            if ( this.autoSize === false ) {
                console.error(err.message);
                return;
            }

            if ( this.width === 4096 && this.height === 4096 ) {
                console.error(err.message);
                return;
            }

            if ( this.width === this.height ) {
                this.width *= 2;
            }
            else {
                this.height = this.width;
            }
            this.layout();
        }
    };

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
    Atlas.prototype.sort = function () {
        // reset rotation
        for (var i = 0; i < this.sprites.length; ++i) {
            var sprite = this.sprites[i];
            sprite.rotated = false;
        }
        //
        var mySortBy = this.sortBy;
        var mySortOrder = this.sortOrder;
        if ( mySortBy === Atlas.SortBy.UseBest ) {
            switch ( this.algorithm ) {
            case Atlas.Algorithm.Basic:
                mySortBy = Atlas.SortBy.Height;
                break;

            case Atlas.Algorithm.Tree:
                mySortBy = Atlas.SortBy.Area;
                break;

            // TODO {
            // case Atlas.Algorithm.MaxRect:
            //     mySortBy = Atlas.SortBy.Area;
            //     break;
            // } TODO end

            default:
                mySortBy = Atlas.SortBy.Height;
                break;
            }
        }
        if ( mySortOrder === Atlas.SortOrder.UseBest ) {
            mySortOrder = Atlas.SortOrder.Descending;
        }

        //
        switch ( mySortBy ) {
            case Atlas.SortBy.Width:
                if ( this.allowRotate )
                    this.sprites.sort( _compareByRotateWidth );
                else
                    this.sprites.sort( _compareByWidth );
                break;

            case Atlas.SortBy.Height:
                if ( this.allowRotate )
                    this.sprites.sort( _compareByRotateHeight );
                else
                    this.sprites.sort( _compareByHeight );
                break;

            case Atlas.SortBy.Area:
                this.sprites.sort( _compareByArea );
                break;

            case Atlas.SortBy.Name:
                this.sprites.sort( _compareByName );
                break;
        }

        // sort order
        if ( mySortOrder === Atlas.SortOrder.Descending ) {
            this.sprites.reverse();
        }
    };

    return Atlas;
})();
