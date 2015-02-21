Fire.TextAsset = (function () {
    var TextAsset = Fire.extend("Fire.TextAsset", Fire.Asset, function () {
        Fire.Asset.call(this);
    });

    TextAsset.prop('text', '', Fire.RawType('text'));

    return TextAsset;
})();
