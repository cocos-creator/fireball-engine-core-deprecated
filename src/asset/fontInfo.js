FIRE.FontInfo = (function () {
    var _super = FIRE.Asset;

    // constructor
    function FontInfo () {
        _super.call(this);

        this.atlas = new FIRE.Atlas();

        // TODO: this.spacing = get this.atlas.customPadding 

        // this.charSetType = TODO: custom, unicode, ascii 
        this.charSet = 
            'abcdefghijklmnopqrstuvwxyz\n' + 
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n' + 
            '1234567890;:_,.-("*!?\')';

        this.fontFamily = '';
        this.fontSize = 50;
        // for fonts that provide only normal and bold, 100-500 are normal, and 600-900 are bold.
        this.fontWeight = 'normal'; // normal(Same as 400) | bold(Same as 700) | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 // bolder lighter

        // color --------------------------------

        this.fillColor = new FIRE.Color( 0.0, 0.0, 0.0, 1.0 );

        // stroke --------------------------------

        this.strokeColor = new FIRE.Color( 1.0, 1.0, 1.0, 1.0 );
        this.strokeWidth = 2;

        /**
         * The shape to be used at the segments and corners of Path items when they have a stroke.
         * String('miter', 'round', 'bevel')
         */
        this.strokeJoin = 'round';

        /**
         * When two line segments meet at a sharp angle and miter joins have been specified for item.strokeJoin, 
         * it is possible for the miter to extend far beyond the item.strokeWidth of the path. The miterLimit 
         * imposes a limit on the ratio of the miter length to the item.strokeWidth.
         */
        this.miterLimit = 10;

        // shadow --------------------------------

        this.shadowColor = new FIRE.Color( 0.0, 0.0, 0.0, 0.5 );
        this.shadowBlur = 2;
        this.shadowOffset = new FIRE.Vec2( 2, 2 );

        // TODO:
        // dash --------------------------------

        /**
         * The dash offset of the stroke.
         */
        // this.dashOffset = 0;

        /**
         * Specifies an array containing the dash and gap lengths of the stroke.
         */
        // this.dashArray = null;
    }
    FIRE.extend("FIRE.FontInfo", FontInfo, _super);

    return FontInfo;
})();
