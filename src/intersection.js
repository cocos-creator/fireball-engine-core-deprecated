/**
 * @class Intersection
 * @static
 */
Fire.Intersection = (function () {
    var Intersection = {};

    function _lineLine ( a1, a2, b1, b2 ) {
        var result;

        var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
        var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
        var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

        if ( u_b !== 0 ) {
            var ua = ua_t / u_b;
            var ub = ub_t / u_b;

            if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @method lineLine
     * @param {Fire.Vec2} a1
     * @param {Fire.Vec2} a2
     * @param {Fire.Vec2} b1
     * @param {Fire.Vec2} b2
     * @return {boolean}
     */
    Intersection.lineLine = _lineLine;

    function _lineRect ( a1, a2, b ) {
        var r0 = new Fire.Vec2( b.x, b.y );
        var r1 = new Fire.Vec2( b.x, b.yMax );
        var r2 = new Fire.Vec2( b.xMax, b.yMax );
        var r3 = new Fire.Vec2( b.xMax, b.y );

        if ( _lineLine( a1, a2, r0, r1 ) )
            return true;

        if ( _lineLine( a1, a2, r1, r2 ) )
            return true;

        if ( _lineLine( a1, a2, r2, r3 ) )
            return true;

        if ( _lineLine( a1, a2, r3, r0 ) )
            return true;

        return false;
    }

    /**
     * @method lineRect
     * @param {Fire.Vec2} a1
     * @param {Fire.Vec2} a2
     * @param {Fire.Vec2} b
     * @return {boolean}
     */
    Intersection.lineRect = _lineRect;

    function _linePolygon ( a1, a2, b ) {
        var length = b.points.length;

        for ( var i = 0; i < length; ++i ) {
            var b1 = b.points[i];
            var b2 = b.points[(i+1)%length];

            if ( _lineLine( a1, a2, b1, b2 ) )
                return true;
        }

        return false;
    }
    Intersection.linePolygon = _linePolygon;

    function _rectRect ( a, b ) {
        var a_min_x = a.x;
        var a_min_y = a.y;
        var a_max_x = a.x + a.width;
        var a_max_y = a.y + a.height;

        var b_min_x = b.x;
        var b_min_y = b.y;
        var b_max_x = b.x + b.width;
        var b_max_y = b.y + b.height;

        return a_min_x <= b_max_x &&
               a_max_x >= b_min_x &&
               a_min_y <= b_max_y &&
               a_max_y >= b_min_y
               ;
    }
    Intersection.rectRect = _rectRect;

    function _rectPolygon ( a, b ) {
        var i;
        var r0 = new Fire.Vec2( a.x, a.y );
        var r1 = new Fire.Vec2( a.x, a.yMax );
        var r2 = new Fire.Vec2( a.xMax, a.yMax );
        var r3 = new Fire.Vec2( a.xMax, a.y );

        // intersection check
        if ( _linePolygon( r0, r1, b ) )
            return true;

        if ( _linePolygon( r1, r2, b ) )
            return true;

        if ( _linePolygon( r2, r3, b ) )
            return true;

        if ( _linePolygon( r3, r0, b ) )
            return true;

        // check if a contains b
        for ( i = 0; i < b.points.length; ++i ) {
            if ( a.contains( b.points[i] ) )
                return true;
        }

        // check if b contains a
        if ( b.contains(r0) )
            return true;

        if ( b.contains(r1) )
            return true;

        if ( b.contains(r2) )
            return true;

        if ( b.contains(r3) )
            return true;

        return false;
    }
    Intersection.rectPolygon = _rectPolygon;

    function _polygonPolygon ( a, b ) {
        var i;

        // check if a intersects b
        for ( i = 0; i < length; ++i ) {
            var a1 = a.points[i];
            var a2 = a.points[(i+1)%length];

            if ( _linePolygon( a1, a2, b ) )
                return true;
        }

        // check if a contains b
        for ( i = 0; i < b.points.length; ++i ) {
            if ( a.contains( b.points[i] ) )
                return true;
        }

        // check if b contains a
        for ( i = 0; i < a.points.length; ++i ) {
            if ( b.contains( a.points[i] ) )
                return true;
        }

        return false;
    }
    Intersection.polygonPolygon = _polygonPolygon;

    return Intersection;
})();
