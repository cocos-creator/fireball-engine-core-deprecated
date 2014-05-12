FIRE.Texture = (function () {
    var _super = FIRE.Asset;

    // constructor
    function Texture ( img ) {
        _super.call(this, img);

        // basic settings
        this.name = "";
        this.image = img;
        this.width = img.width;
        this.height = img.height;
    }
    FIRE.extend(Texture, _super);

    return Texture;
})();
