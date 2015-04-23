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

    /**
     * Returns pixel color at coordinates (x, y).
     *
     * If the pixel coordinates are out of bounds (larger than width/height or small than 0),
     * they will be clamped or repeated based on the texture's wrap mode.
     *
     * @method getPixel
     * @param {number} x
     * @param {nmber} y
     * @return {Fire.Color}
     */
    Texture.prototype.getPixel = function (x, y) {
        if (!canvasCtxToGetPixel) {
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            canvasCtxToGetPixel = canvas.getContext('2d');
        }
        if (this.wrapMode === Texture.WrapMode.Clamp) {
            x = Math.clamp(x, 0, this.image.width);
            y = Math.clamp(y, 0, this.image.height);
        }
        else if (this.wrapMode === Texture.WrapMode.Repeat) {
            x = x % this.image.width;
            if (x < 0) {
                x += this.image.width
            }
            y = y % this.image.width;
            if (y < 0) {
                y += this.image.width
            }
        }
        canvasCtxToGetPixel.clearRect(0, 0, 1, 1);
        canvasCtxToGetPixel.drawImage(this.image, x, y, 1, 1, 0, 0, 1, 1);

        var imgBytes = null;
        try {
            imgBytes = canvasCtxToGetPixel.getImageData(0, 0, 1, 1).data;
        }
        catch (e) {
            Fire.error("An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.");
            return Fire.Color.transparent;
        }
        var result = new Fire.Color();
        result.r = imgBytes[0] / 255;
        result.g = imgBytes[1] / 255;
        result.b = imgBytes[2] / 255;
        result.a = imgBytes[3] / 255;
        return result;
    }

    return Texture;
})();

var canvasCtxToGetPixel = null;
