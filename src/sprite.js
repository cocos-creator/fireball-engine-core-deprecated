FIRE.Sprite = (function () {

    var Sprite = FIRE.define('FIRE.Sprite', FIRE.Asset, function (img) {
        Sprite.$super.call(this);
        
        // init some properties with constructor argument

        this.rawTexture = new FIRE.Texture(img);
        this.texture = new FIRE.Texture(img);
        this.width = img.width;
        this.height = img.height;
    });
    
    // basic settings
    Sprite.prop('rawTexture', null, FIRE.EditorOnly);        // untrimmed raw texture
    Sprite.prop('texture', null);           // texture for rendering
    Sprite.prop('rotated', false);
    Sprite.prop('trim', false, FIRE.EditorOnly);
    Sprite.prop('trimThreshold', 1, FIRE.EditorOnly);

    // trims
    Sprite.prop('trimX', 0, FIRE.Integer);
    Sprite.prop('trimY', 0, FIRE.Integer);
    Sprite.prop('width', 0, FIRE.Integer);  // trimmed width
    Sprite.prop('height', 0, FIRE.Integer); // trimmed height
    Sprite.prop('x', 0, FIRE.Integer);
    Sprite.prop('y', 0, FIRE.Integer);
    //

    Sprite.prototype.__defineGetter__('rotatedWidth', function () {
        return this.rotated ? this.height : this.width;
    });

    Sprite.prototype.__defineGetter__('rotatedHeight', function () {
        return this.rotated ? this.width : this.height;
    });

    // TODO: add rawWidth/rawHeight getter ?

    return Sprite;
})();
