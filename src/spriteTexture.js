FIRE.SpriteTexture = (function () {
    var _super = FIRE.Texture;

    // constructor
    function SpriteTexture ( img ) {
        _super.call(this,img);

        // basic settings
        this.rotated = false;
        this.trim = false;
        this.trimThreshold = 1;

        // trims
        this.trimX = 0;
        this.trimY = 0;
        this.x = 0;
        this.y = 0;
    }
    FIRE.extend(SpriteTexture, _super);

    SpriteTexture.prototype.rotatedWidth = function () {
        return this.rotated ? this.height : this.width;
    };

    SpriteTexture.prototype.rotatedHeight = function () {
        return this.rotated ? this.width : this.height;
    };

    return SpriteTexture;
})();
