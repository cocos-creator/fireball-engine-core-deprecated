FIRE.Vec2 = (function () {
    function Vec2( x, y ) {
        this.x = x;
        this.y = y;
    }
    FIRE.registerClass('FIRE.Vec2', Vec2);

    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };

    Vec2.prototype.toString = function () {
        return "(" + 
            this.x.toFixed(2) + ", " + 
            this.y.toFixed(2) + ")"
        ;
    };

    return Vec2;
})();

