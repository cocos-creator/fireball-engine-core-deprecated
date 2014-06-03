FIRE.Color = (function () {
    var _super = FIRE.FObject;

    function Color( r, g, b, a ) {
        _super.call(this);

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    FIRE.extend(Color, _super);

    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b, this.a);
    };

    Color.prototype.toString = function () {
        return "rgba(" + 
            this.r.toFixed(2) + ", " + 
            this.g.toFixed(2) + ", " + 
            this.b.toFixed(2) + ", " + 
            this.a.toFixed(2) + ")"
        ;
    };

    return Color;
})();

