var Rect = (function () {
    /**
     * @class Rect
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    function Rect( x, y, w, h ) {
        this.x = typeof x === 'number' ? x : 0.0;
        this.y = typeof y === 'number' ? y : 0.0;
        this.width = typeof w === 'number' ? w : 0.0;
        this.height = typeof h === 'number' ? h : 0.0;
    }
    Fire.setClassName('Fire.Rect', Rect);

    /**
     * @method fromVec2
     * @param {Vec2} v1
     * @param {Vec2} v2
     * @return {Rect}
     */
    Rect.fromVec2 = function ( v1, v2 ) {
        var min_x = Math.min( v1.x, v2.x );
        var min_y = Math.min( v1.y, v2.y );
        var max_x = Math.max( v1.x, v2.x );
        var max_y = Math.max( v1.y, v2.y );

        return new Rect ( min_x, min_y, max_x - min_x, max_y - min_y );
    };

    /**
     * Check if rect contains
     * @method contain
     * @param a {Rect} Rect a
     * @param b {Rect} Rect b
     * @return {Number} The contains result, 1 is a contains b, -1 is b contains a, 0 is no contains
     */
    Rect.contain = function _Contain ( a, b ) {
        if ( a.x <= b.x &&
             a.x + a.width >= b.x + b.width &&
             a.y <= b.y &&
             a.y + a.height >= b.y + b.height )
        {
            // a contains b
            return 1;
        }
        if ( b.x <= a.x &&
             b.x + b.width >= a.x + a.width &&
             b.y <= a.y &&
             b.y + b.height >= a.y + a.height )
        {
            // b contains a
            return -1;
        }
        return 0;
    };

    Rect.prototype.clone = function () {
        return new Rect(this.x, this.y, this.width, this.height);
    };

    Rect.prototype.equals = function (other) {
        return this.x === other.x &&
               this.y === other.y &&
               this.width === other.width &&
               this.height === other.height;
    };

    Rect.prototype.toString = function () {
        return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ', ' + this.width.toFixed(2) +
               ', ' + this.height.toFixed(2) + ')';
    };

    Object.defineProperty(Rect.prototype, 'xMax', {
        get: function () { return this.x + this.width; }
    });

    Object.defineProperty(Rect.prototype, 'yMax', {
        get: function () { return this.y + this.height; }
    });

    Object.defineProperty(Rect.prototype, 'center', {
        get: function () {
            return new Fire.Vec2( this.x + this.width * 0.5,
                                  this.y + this.height * 0.5 );
        }
    });

    Rect.prototype.intersects = function ( rect ) {
        return Fire.Intersection.rectRect( this, rect );
    };

    Rect.prototype.contains = function ( point ) {
        if ( this.x <= point.x &&
             this.x + this.width >= point.x &&
             this.y <= point.y &&
             this.y + this.height >= point.y )
        {
            return true;
        }
        return false;
    };

    Rect.prototype.containsRect = function ( rect ) {
        if ( this.x <= rect.x &&
             this.x + this.width >= rect.x + rect.width &&
             this.y <= rect.y &&
             this.y + this.height >= rect.y + rect.height )
        {
            return true;
        }
        return false;
    };

    return Rect;
})();

Fire.Rect = Rect;

/**
 * The convenience method to create a new Rect
 * @method Fire.rect
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [w=0]
 * @param {number} [h=0]
 * @return {Rect}
 */
Fire.rect = function rect (x, y, w, h) {
    if (Array.isArray(x)) {
        return new Rect(x[0], x[1], x[2], x[3]);
    }
    else {
        return new Rect(x, y, w, h);
    }
};
