Fire.Color = (function () {
    function Color( r, g, b, a ) {
        this.r = typeof r !== 'undefined' ? r : 0;
        this.g = typeof g !== 'undefined' ? g : 0;
        this.b = typeof b !== 'undefined' ? b : 0;
        this.a = typeof a !== 'undefined' ? a : 1;
    }
    Fire.registerClass('Fire.Color', Color);

    Color.prototype.clone = function () {
        return new Color(this.r, this.g, this.b, this.a);
    };

    Color.prototype.equals = function (other) {
        return this.r === other.r &&
               this.g === other.g &&
               this.b === other.b &&
               this.a === other.a;
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
                (this.r * 255 | 0 ) + "," + 
                (this.g * 255 | 0 ) + "," + 
                (this.b * 255 | 0 ) + "," + 
                this.a.toFixed(2) + ")"
            ;
        }
        else if ( opt === 'rgb' ) {
            return "rgb(" + 
                (this.r * 255 | 0 ) + "," + 
                (this.g * 255 | 0 ) + "," + 
                (this.b * 255 | 0 ) + ")"
            ;
        }
        else {
            return '#' + this.toHEX(opt);
        }
        return "";
    };

    Color.prototype.equalTo = function ( rhs ) {
        return (rhs instanceof Color &&
                this.r === rhs.r &&
                this.g === rhs.g &&
                this.b === rhs.b &&
                this.a === rhs.a);
    };

    Color.prototype.clamp = function () {
        this.r = Math.clamp(this.r, 0, 1);
        this.g = Math.clamp(this.g, 0, 1);
        this.b = Math.clamp(this.b, 0, 1);
        this.a = Math.clamp(this.a, 0, 1);
    };

    Color.prototype.fromHEX = function (hexString) {
        var hex = parseInt(((hexString.indexOf('#') > -1) ? hexString.substring(1) : hexString), 16);
        this.r = hex >> 16;
        this.g = (hex & 0x00FF00) >> 8;
        this.b = (hex & 0x0000FF);
        return this;
    };

    Color.prototype.toHEX = function ( fmt ) {
        var hex = [
            (this.r * 255 | 0 ).toString(16),
            (this.g * 255 | 0 ).toString(16),
            (this.b * 255 | 0 ).toString(16),
        ];
        var i = -1;
        if ( fmt === '#rgb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length > 1 ) {
                    hex[i] = hex[i][0];
                }
            }
        }
        else if ( fmt === '#rrggbb' ) {
            for ( i = 0; i < hex.length; ++i ) {
                if ( hex[i].length == 1 ) {
                    hex[i] = '0' + hex[i];
                }
            }
        }
        return hex.join('');
    };

    Color.prototype.toRGBValue = function () {
        return (this.r * 255 << 16) + (this.g * 255 << 8) + this.b * 255;
    };

    Color.prototype.fromHSV = function ( h, s, v ) {
        var rgb = Fire.hsv2rgb( h, s, v ); 
        this.r = rgb.r;
        this.g = rgb.g;
        this.b = rgb.b;
        return this;
    };

    Color.prototype.toHSV = function () {
        return Fire.rgb2hsv( this.r, this.g, this.b );
    };

    return Color;
})();

