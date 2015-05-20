
var BitmapFont = (function () {

    /**
     * @class BitmapFont
     * @extends Asset
     */
    var BitmapFont = Fire.Class({
        name: "Fire.BitmapFont",

        extends: Fire.Asset,

        properties:{
            /**
             * The atlas  or raw texture
             * @property texture
             * @type {Texture}
             * @default null
             */
            texture: {
                default: null,
                type: Fire.Texture,
                visible: false
            },
            charInfos: {
                default: [],
                visible: false
            },
            kernings: {
                default: [],
                visible: false
            },
            /**
             * The base-line of the text when draw
             * @property baseLine
             * @type {number}
             * @default 0
             */
            baseLine: {
                default: 0,
                type: Fire.Integer,
                readonly: true
            },
            /**
             * The space of the line
             * @property lineHeight
             * @type {number}
             * @default 0
             */
            lineHeight: {
                default: 0,
                type: Fire.Integer,
                readonly: true
            },
            /**
             * The size in pixel of the font
             * @property size
             * @type {number}
             * @default 0
             */
            size: {
                default: 0,
                type: Fire.Integer,
                readonly: true
            },
            face: {
                default: null,
                type: Fire.Integer,
                visible: false
            }
        }
    });
    return BitmapFont;
})();

Fire.BitmapFont = BitmapFont;
