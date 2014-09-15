FIRE.Texture = (function () {

    /**
     * @param {Image} [img] - the html image element to render
     */
    var Texture = FIRE.define('FIRE.Texture', FIRE.Asset, function (img) {
        Texture.$super.call(this);

        this.name = "";
        if (img) {
            this.image = img;
            this.width = img.width;
            this.height = img.height;
        }
    });

    Texture.prop('name', '', FIRE.EditorOnly);
    Texture.prop('image', null, FIRE.HostType(FIRE.isWeb && Image));
    Texture.prop('width', 0, FIRE.Integer);
    Texture.prop('height', 0, FIRE.Integer);

    //Texture.prototype.onAfterDeserialize = function () {
    //    this.width = this.image.width;
    //    this.height = this.image.height;
    //};

    return Texture;
})();
