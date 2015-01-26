var JsonAsset = (function () {

    var JsonAsset = Fire.define('Fire.JsonAsset', Asset)
                        .prop('json', null, Fire.RawTypes('json'));

    return JsonAsset;
})();

Fire.JsonAsset = JsonAsset;
