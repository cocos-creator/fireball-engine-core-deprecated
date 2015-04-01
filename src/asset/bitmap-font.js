
var BitmapFont = (function () {

    //var CharInfo = {
    //    id: -1,
    //    trim_x: 0,
    //    trim_y: 0,
    //    x: 0,
    //    y: 0,
    //    width: 0,
    //    height: 0,
    //    xOffset: 0,
    //    yOffset: 0,
    //    xAdvance: 0,
    //    rotated: false,
    //};

    //var Kerning = {
    //    first: 0,
    //    second: 0,
    //    amount: 0,
    //};

    var BitmapFont = Fire.extend("Fire.BitmapFont", Fire.Asset);

    BitmapFont.prop('texture', null, Fire.ObjectType(Fire.Texture), Fire.HideInInspector);
    BitmapFont.prop('charInfos', [], Fire.HideInInspector);
    BitmapFont.prop('kernings', [], Fire.HideInInspector);
    BitmapFont.prop('baseLine', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);
    BitmapFont.prop('lineHeight', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);
    BitmapFont.prop('size', 0, Fire.Integer_Obsoleted, Fire.ReadOnly);
    BitmapFont.prop('face', null, Fire.HideInInspector);

    return BitmapFont;
})();

Fire.BitmapFont = BitmapFont;
