Fire.TextAsset = (function () {
    var TextAsset = Fire.extend("Fire.TextAsset", Fire.Asset);

    TextAsset.prop('text', '', Fire.RawType('text'));

    return TextAsset;
})();
