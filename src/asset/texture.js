Fire.Texture = (function () {

    /**
     * Class for texture handling.
     * Use this to create textures on the fly or to modify existing texture assets.
     *
     * @class Texture
     * @extends Asset
     * @constructor
     * @param {Image} [img] - the html image element to render
     */
    var Texture = Fire.extend('Fire.Texture', Fire.Asset, function () {
        var img = arguments[0];
        if (img) {
            this.image = img;
            this.width = img.width;
            this.height = img.height;
        }
    });

    /**
     * @class WrapMode
     * @static
     * @namespace Texture
     */
    Texture.WrapMode = Fire.defineEnum({
        /**
         * @property Repeat
         * @type number
         */
        Repeat: -1,
        /**
         * @property Clamp
         * @type number
         */
        Clamp: -1
    });

    /**
     * @class FilterMode
     * @static
     * @namespace Texture
     */
    Texture.FilterMode = Fire.defineEnum({
        /**
         * @property Point
         * @type number
         */
        Point: -1,
        /**
         * @property Bilinear
         * @type number
         */
        Bilinear: -1,
        /**
         * @property Trilinear
         * @type number
         */
        Trilinear: -1
    });

    /**
     * @class Texture
     */
    /**
     * @property image
     * @type Image
     */
    Texture.prop('image', null, Fire.RawType('image'), Fire.HideInInspector);
    /**
     * @property width
     * @type number
     */
    Texture.prop('width', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);
    /**
     * @property height
     * @type number
     */
    Texture.prop('height', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);
    /**
     * @property wrapMode
     * @type Texture.WrapMode
     */
    Texture.prop('wrapMode', Texture.WrapMode.Clamp, Fire.Enum(Texture.WrapMode), Fire.ReadOnly);
    /**
     * @property filterMode
     * @type Texture.FilterMode
     */
    Texture.prop('filterMode', Texture.FilterMode.Bilinear, Fire.Enum(Texture.FilterMode), Fire.ReadOnly);

    //Texture.prototype.onAfterDeserialize = function () {
    //    this.width = this.image.width;
    //    this.height = this.image.height;
    //};

    return Texture;
})();
