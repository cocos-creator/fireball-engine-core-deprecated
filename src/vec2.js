FIRE.Vec2 = (function () {
    var _super = FIRE.FObject;

    function Vec2( x, y ) {
        _super.call(this);

        this.x = x;
        this.y = y;
    }
    FIRE.extend(Vec2, _super);
    Vec2.prototype.__classname__ = "FIRE.Vec2";


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

