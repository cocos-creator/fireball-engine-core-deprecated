var JsonAsset = (function () {

    var JsonAsset = Fire.define('Fire.JsonAsset', Asset)
                        .prop('json', null, Fire.HostType('json'));

    return JsonAsset;
})();

Fire.JsonAsset = JsonAsset;
