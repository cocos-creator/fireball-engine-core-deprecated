FIRE.Rect = (function () {
    var _super = FIRE.FObject;

    function Rect( x, y, w, h ) {
        _super.call(this);

        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    FIRE.extend(Rect, _super);

    /**
     * Check if rect contains
     *
     * @param a {FIRE.Rect} Rect a
     * @param b {FIRE.Rect} Rect b
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

    return Rect;
})();

