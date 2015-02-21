var JsonAsset = (function () {

    var JsonAsset = Fire.extend('Fire.JsonAsset', Asset)
                        .prop('json', null, Fire.RawType('json'));

    return JsonAsset;
})();

Fire.JsonAsset = JsonAsset;
