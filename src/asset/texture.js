Fire.Texture = (function () {

    /**
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

    // enum WrapMode
    Texture.WrapMode = Fire.defineEnum({
        Repeat: -1,
        Clamp: -1
    });

    // enum FilterMode
    Texture.FilterMode = Fire.defineEnum({
        Point: -1,
        Bilinear: -1,
        Trilinear: -1
    });

    Texture.prop('image', null, Fire.RawType('image'), Fire.HideInInspector);
    Texture.prop('width', 0, Fire.Integer, Fire.ReadOnly);
    Texture.prop('height', 0, Fire.Integer, Fire.ReadOnly);
    Texture.prop('wrapMode', Texture.WrapMode.Clamp, Fire.Enum(Texture.WrapMode), Fire.ReadOnly);
    Texture.prop('filterMode', Texture.FilterMode.Bilinear, Fire.Enum(Texture.FilterMode), Fire.ReadOnly);

    //Texture.prototype.onAfterDeserialize = function () {
    //    this.width = this.image.width;
    //    this.height = this.image.height;
    //};

    return Texture;
})();
