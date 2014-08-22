FIRE.Sprite = (function () {
    var _super = FIRE.Asset;

    // constructor
    function Sprite ( img ) {
        _super.call(this);

        // basic settings
        this.rawTexture = new FIRE.Texture(img);    // untrimmed raw texture, editor only
        this.texture = new FIRE.Texture(img);       // texture for rendering
        this.rotated = false;
        this.trim = false;          // TODO, editor only ?
        this.trimThreshold = 1;     // TODO, editor only ?

        // trims
        this.trimX = 0;
        this.trimY = 0;
        this.width = img.width;     // trimmed width
        this.height = img.height;   // trimmed height
        this.x = 0;
        this.y = 0;
    }
    FIRE.extend("FIRE.Sprite", Sprite, _super);

    Sprite.prototype.__defineGetter__('rotatedWidth', function () {
        return this.rotated ? this.height : this.width;
    });

    Sprite.prototype.__defineGetter__('rotatedHeight', function () {
        return this.rotated ? this.width : this.height;
    });

    // TODO: add rawWidth/rawHeight getter ?

    return Sprite;
})();
