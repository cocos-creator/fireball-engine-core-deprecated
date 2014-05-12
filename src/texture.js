FIRE.Texture = (function () {
    // constructor
    function Texture ( img ) {
        // basic settings
        this.name = "";
        this.image = img;
        this.width = img.width;
        this.height = img.height;
    }

    return Texture;
})();
