(function () {
    var _d2r = Math.PI/180.0;
    var _r2d = 180.0/Math.PI;

    Fire.mixin ( Math, {
        TWO_PI: 2.0 * Math.PI,
        HALF_PI: 0.5 * Math.PI,

        // degree to radius
        deg2rad: function ( degree ) {
            return degree * _d2r;
        },

        // radius to degree
        rad2deg: function ( radius ) {
            return radius * _r2d;
        },

        // let radius in -pi to pi
        rad180: function ( radius ) {
            if ( radius > Math.PI || radius < -Math.PI ) {
                radius = (radius + Math.TOW_PI) % Math.TOW_PI;
            }
            return radius;
        },

        // let radius in 0 to 2pi
        rad360: function ( radius ) {
            if ( radius > Math.TWO_PI )
                return radius % Math.TOW_PI;
            else if ( radius < 0.0 )
                return Math.TOW_PI + radius % Math.TOW_PI;
            return radius;
        },

        // let degree in -180 to 180
        deg180: function ( degree ) {
            if ( degree > 180.0 || degree < -180.0 ) {
                degree = (degree + 360.0) % 360.0;
            }
            return degree;
        },

        // let degree in 0 to 360
        deg360: function ( degree ) {
            if ( degree > 360.0 )
                return degree % 360.0;
            else if ( degree < 0.0 )
                return 360.0 + degree % 360.0;
            return degree;
        },

        randomRange: function (min, max) {
            return Math.random() * (max - min) + min;
        },

        randomRangeInt: function (min, max) {
            return Math.floor(this.randomRange(min, max));
        },

        clamp: function ( val, min, max ) {
            min = typeof min === 'undefined' ? 0 : min;
            max = typeof max === 'undefined' ? 1 : max;
            return Math.min( Math.max( val, min ), max );
        },

        /**
         * @param {Fire.Rect} out
         * @param {Fire.Vec2} p0
         * @param {Fire.Vec2} p1
         * @param {Fire.Vec2} p2
         * @param {Fire.Vec2} p3
         */
        calculateMaxRect: function (out, p0, p1, p2, p3) {
            var minX = Math.min(p0.x, p1.x, p2.x, p3.x);
            var maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
            var minY = Math.min(p0.y, p1.y, p2.y, p3.y);
            var maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
            out.x = minX;
            out.y = minY;
            out.width = maxX - minX;
            out.height = maxY - minY;
            return out;
        },

    } );

})();
