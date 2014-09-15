FIRE.Texture = (function () {

    /**
     * @param {Image} [img] - the html image element to render
     */
    var Texture = FIRE.define('FIRE.Texture', FIRE.Asset, function (img) {
        Texture.$super.call(this);

        if (img) {
            this.image = img;
            this.width = img.width;
            this.height = img.height;
        }
    });

    // enum WrapMode
    Texture.WrapMode = (function (t) {
        t[t.Repeat = 0] = 'Repeat';
        t[t.Clamp  = 1] = 'Clamp';
        return t;
    })({});

    // enum FilterMode
    Texture.FilterMode = (function (t) {
        t[t.Point       = 0] = 'Point';
        t[t.Bilinear    = 1] = 'Bilinear';
        t[t.Trilinear   = 2] = 'Trilinear';
        return t;
    })({});

    Texture.prop('image', null, FIRE.HostType(FIRE.isWeb && Image));
    Texture.prop('width', 0, FIRE.Integer);
    Texture.prop('height', 0, FIRE.Integer);
    Texture.prop('wrapMode', Texture.WrapMode.Clamp, FIRE.Enum(Texture.WrapMode));
    Texture.prop('filterMode', Texture.FilterMode.Bilinear, FIRE.Enum(Texture.FilterMode));

    //Texture.prototype.onAfterDeserialize = function () {
    //    this.width = this.image.width;
    //    this.height = this.image.height;
    //};

    return Texture;
})();
