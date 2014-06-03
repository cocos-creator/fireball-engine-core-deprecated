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

    Color.prototype.toCSS = function ( opt ) {
        if ( opt === 'rgba' ) {
            return "rgba(" + 
                Math.floor(this.r * 255) + "," + 
                Math.floor(this.g * 255) + "," + 
                Math.floor(this.b * 255) + "," + 
                this.a.toFixed(2) + ")"
            ;
        }
        else if ( opt === 'rgb' ) {
            return "rgb(" + 
                Math.floor(this.r * 255) + "," + 
                Math.floor(this.g * 255) + "," + 
                Math.floor(this.b * 255) + ")"
            ;
        }
        else if ( opt === '#rgb' ) {
            // TODO
            return "";
        }
        else if ( opt === '#rrggbb' ) {
            // TODO
            return "";
        }
        return "";
    };

    Color.prototype.equalTo = function ( rhs ) {
        if ( !(rhs instanceof FIRE.Color) )
            return false;

        if ( this.r !== rhs.r )
            return false;
        if ( this.g !== rhs.g )
            return false;
        if ( this.b !== rhs.b )
            return false;
        if ( this.a !== rhs.a )
            return false;

        return true;
    };

    return Color;
})();

