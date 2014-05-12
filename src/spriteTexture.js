FIRE.SpriteTexture = (function (super_) {
    // constructor
    function SpriteTexture ( img ) {
        super_.call(this,img);

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
    FIRE.extend(SpriteTexture, super_);

    SpriteTexture.prototype.rotatedWidth = function () {
        return this.rotated ? this.height : this.width;
    };

    SpriteTexture.prototype.rotatedHeight = function () {
        return this.rotated ? this.width : this.height;
    };

    return SpriteTexture;
})(Texture);
