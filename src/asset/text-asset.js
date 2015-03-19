Fire.TextAsset = (function () {
    var TextAsset = Fire.extend("Fire.TextAsset", Fire.Asset);

    TextAsset.prop('text', '', Fire.MultiText, Fire.RawType('text'));

    return TextAsset;
})();
