Fire.Sprite = (function () {

    /**
     * Represents a Sprite object which obtained from Texture.
     * @class Sprite
     * @constructor
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

    /**
     * @property pivot
     * @type Vec2
     * @default new Fire.Vec2(0.5, 0.5)
     */
    Sprite.prop('pivot', new Fire.Vec2(0.5, 0.5), Fire.Tooltip('The pivot is normalized, like a percentage.\n' +
                                                               '(0,0) means the bottom-left corner and (1,1) means the top-right corner.\n' +
                                                               'But you can use values higher than (1,1) and lower than (0,0) too.'));

    // trim info

    /**
     * @property trimX
     * @type number
     */
    Sprite.prop('trimX', 0, Fire.Integer);
    /**
     * @property trimY
     * @type number
     */
    Sprite.prop('trimY', 0, Fire.Integer);
    /**
     * @property width
     * @type number
     */
    Sprite.prop('width', 0, Fire.Integer);
    /**
     * @property height
     * @type number
     */
    Sprite.prop('height', 0, Fire.Integer);

    /**
     * @property texture
     * @type Texture
     */
    Sprite.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);

    /**
     * @property rotated
     * @type boolean
     * @default false
     */
    Sprite.prop('rotated', false, Fire.HideInInspector);

    // raw texture info (used for texture-offset calculation)

    /**
     * uv of the sprite in atlas-texture
     * @property x
     * @type number
     */
    Sprite.prop('x', 0, Fire.Integer, Fire.HideInInspector);

    /**
     * uv of the sprite in atlas-texture
     * @property y
     * @type number
     */
    Sprite.prop('y', 0, Fire.Integer, Fire.HideInInspector);

    /**
     * @property rawWidth
     * @type number
     */
    Sprite.prop('rawWidth', 0, Fire.Integer, Fire.HideInInspector);

    /**
     * @property rawHeight
     * @type number
     */
    Sprite.prop('rawHeight', 0, Fire.Integer, Fire.HideInInspector);

    /**
     * @property rotatedWidth
     * @type number
     * @readOnly
     */
    Object.defineProperty(Sprite.prototype, 'rotatedWidth', {
        get: function () { return this.rotated ? this.height : this.width; }
    });

    /**
     * @property rotatedHeight
     * @type number
     * @readOnly
     */
    Object.defineProperty(Sprite.prototype, 'rotatedHeight', {
        get: function () { return this.rotated ? this.width : this.height; }
    });

    return Sprite;
})();
