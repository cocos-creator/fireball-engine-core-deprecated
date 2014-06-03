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

    Color.prototype.clamp = function () {
        this.r = Math.min(1.0, Math.max(0, this.r));
        this.g = Math.min(1.0, Math.max(0, this.g));
        this.b = Math.min(1.0, Math.max(0, this.b));
        this.a = Math.min(1.0, Math.max(0, this.a));
    };


    Color.prototype.fromHEX = function (hexString) {
        var hex = parseInt(((hexString.indexOf('#') > -1) ? hexString.substring(1) : hexString), 16);
        this.r = hex >> 16;
        this.g = (hex & 0x00FF00) >> 8;
        this.b = (hex & 0x0000FF);
    };

    Color.prototype.fromHSB = function ( h_, s_, b_ ) {
        var r;
        var g;
        var b;
        var h1 = Math.round(h_);
        var s1 = Math.round(s_*255/100);
        var v1 = Math.round(b_*255/100);
        if ( s1 === 0 ) {
            r = g = b = v1;
        } 
        else {
            var t1 = v1;
            var t2 = (255-s1)*v1/255;
            var t3 = (t1-t2)*(h1%60)/60;
            if(h1==360) h1 = 0;
            if(h1<60) {r=t1; b=t2; g=t2+t3;}
            else if(h1<120) {g=t1; b=t2; r=t1-t3;}
            else if(h1<180) {g=t1; r=t2; b=t2+t3;}
            else if(h1<240) {b=t1; r=t2; g=t1-t3;}
            else if(h1<300) {b=t1; g=t2; r=t2+t3;}
            else if(h1<360) {r=t1; g=t2; b=t1-t3;}
            else {r=0; g=0;	b=0;}
        }
        this.r = Math.round(r);
        this.g = Math.round(g);
        this.b = Math.round(b);
    };

    return Color;
})();

