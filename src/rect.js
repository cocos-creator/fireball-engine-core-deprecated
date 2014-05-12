FIRE.Rect = (function () {
    function Rect( x, y, w, h ) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    // ------------------------------------------------------------------ 
    /// \param _a rect a
    /// \param _b rect b
    /// \result the contains result
    /// check if rect contains, 1 is _a contains _b, -1 is _b contains _a, 0 is no contains 
    // ------------------------------------------------------------------ 
    
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

