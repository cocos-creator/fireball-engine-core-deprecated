
var BitmapFont = (function () {

    /**
     * The texture-info asset
     * @class BitmapFont
     * @extends Asset
     */
    var BitmapFont = Fire.extend("Fire.BitmapFont", Fire.Asset);

    /**
     * The atlas  or raw texture
     * @property texture
     * @type {Texture}
     * @default null
     */
    BitmapFont.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);

    BitmapFont.prop('charInfos', [], Fire.HideInInspector);

    BitmapFont.prop('kernings', [], Fire.HideInInspector);

    /**
     * The base-line of the text when draw
     * @property baseLine
     * @type {number}
     * @default 0
     */
    BitmapFont.prop('baseLine', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);

    /**
     * The space of the line
     * @property lineHeight
     * @type {number}
     * @default 0
     */
    BitmapFont.prop('lineHeight', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);

    /**
     * The size in pixel of the font
     * @property size
     * @type {number}
     * @default 0
     */
    BitmapFont.prop('size', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);

    BitmapFont.prop('face', null, Fire.HideInInspector);

    return BitmapFont;
})();

Fire.BitmapFont = BitmapFont;
