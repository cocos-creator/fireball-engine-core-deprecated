Fire.Sprite = (function () {

    /**
     * @param {Image} [img] - Specify the html image element to render so you can create Sprite dynamically.
     */
    var Sprite = Fire.define('Fire.Sprite', Fire.Asset, function (img) {
        Sprite.$super.call(this);
        
        if (img) {
            this.rawTexture = new Fire.Texture(img);
            this.texture = new Fire.Texture(img);
            this.width = img.width;
            this.height = img.height;
        }
    });
    
    // basic settings
    Sprite.prop('name', '', Fire.EditorOnly);
    Sprite.prop('rawTexture', null, Fire.ObjectType(Fire.Texture), Fire.Tooltip('untrimmed raw texture'), Fire.EditorOnly);
    Sprite.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.Tooltip('texture to render'));
    Sprite.prop('rotated', false);
    Sprite.prop('trim', false, Fire.EditorOnly);
    Sprite.prop('trimThreshold', 1, Fire.EditorOnly);

    // trims
    Sprite.prop('trimX', 0, Fire.Integer);
    Sprite.prop('trimY', 0, Fire.Integer);
    Sprite.prop('width', 0, Fire.Integer, Fire.Tooltip('trimmed width'));
    Sprite.prop('height', 0, Fire.Integer, Fire.Tooltip('trimmed height'));
    Sprite.prop('x', 0, Fire.Integer);
    Sprite.prop('y', 0, Fire.Integer);
    //

    Object.defineProperty(Sprite.prototype, 'rotatedWidth', {
        get: function () { return this.rotated ? this.height : this.width; }
    });

    Object.defineProperty(Sprite.prototype, 'rotatedHeight', {
        get: function () { return this.rotated ? this.width : this.height; }
    });

    // TODO: add rawWidth/rawHeight getter ?

    return Sprite;
})();
