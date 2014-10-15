Fire.Rect = (function () {
    function Rect( x, y, w, h ) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    Fire.registerClass('Fire.Rect', Rect);

    /**
     * Check if rect contains
     *
     * @param a {Fire.Rect} Rect a
     * @param b {Fire.Rect} Rect b
     * @return {Number} The contains result, 1 is a contains b, -1 is b contains a, 0 is no contains 
     */
    Rect.contains = function _Contains ( a, b ) {
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

    return Rect;
})();

