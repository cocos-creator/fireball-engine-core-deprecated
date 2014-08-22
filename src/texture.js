FIRE.Texture = (function () {
    var _super = FIRE.Asset;

    // constructor
    function Texture ( img ) {
        _super.call(this);

        // basic settings
        this.name = "";
        this.image = img;
        this.width = img.width;
        this.height = img.height;
    }
    FIRE.extend("FIRE.Texture", Texture, _super);

    return Texture;
})();
