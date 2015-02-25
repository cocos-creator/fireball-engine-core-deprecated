Fire.Sprite = (function () {

    /**
     * @param {Image} [img] - Specify the html image element to render so you can create Sprite dynamically.
     */
    var Sprite = Fire.extend('Fire.Sprite', Fire.Asset, function () {
        var img = arguments[0];
        if (img) {
            this.texture = new Fire.Texture(img);
            this.width = img.width;
            this.height = img.height;
        }
    });

    //
    Sprite.prop('pivot', new Fire.Vec2(0.5, 0.5), Fire.Tooltip('The pivot is normalized, like a percentage.\n' +
                                                               '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                                                               'But you can use values higher than (1,1) and lower than (0,0) too.'));

    // trim info
    Sprite.prop('trimX', 0, Fire.Integer);
    Sprite.prop('trimY', 0, Fire.Integer);
    Sprite.prop('width', 0, Fire.Integer);
    Sprite.prop('height', 0, Fire.Integer);

    //
    Sprite.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);
    Sprite.prop('rotated', false, Fire.HideInInspector);

    // raw texture info (used for texture-offset calculation)
    Sprite.prop('x', 0, Fire.Integer, Fire.HideInInspector); // uv of the sprite in atlas-texture
    Sprite.prop('y', 0, Fire.Integer, Fire.HideInInspector); // uv of the sprite in atlas-texture
    Sprite.prop('rawWidth', 0, Fire.Integer, Fire.HideInInspector);
    Sprite.prop('rawHeight', 0, Fire.Integer, Fire.HideInInspector);

    Object.defineProperty(Sprite.prototype, 'rotatedWidth', {
        get: function () { return this.rotated ? this.height : this.width; }
    });

    Object.defineProperty(Sprite.prototype, 'rotatedHeight', {
        get: function () { return this.rotated ? this.width : this.height; }
    });

    return Sprite;
})();
