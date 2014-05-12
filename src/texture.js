FIRE.Texture = (function (super_) {
    // constructor
    function Texture ( img ) {
        super_.call(this, img);

        // basic settings
        this.name = "";
        this.image = img;
        this.width = img.width;
        this.height = img.height;
    }
    FIRE.extend(Texture, super_);

    return Texture;
})(FIRE.Asset);
