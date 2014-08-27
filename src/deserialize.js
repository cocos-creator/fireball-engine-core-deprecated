
var _Deserializer = (function () {

    /**
     * @class
     * @param {String} str - The Json string to deserialize
     */
    function _Deserializer(str) {
        this.obj = JSON.parse(str);

        if (Array.isArray(this.obj)) {
            var assetObj = this.obj.pop();
            _unreference(this, this.obj);
            this.data = _deserializeArray(this, assetObj, this.obj);
            console.log(this.data);
        }
        else {
            this.data = _deserializeAsset(this, this.obj);
        }

        this.obj = null;
    };

    /**
     * @param {Object} obj - The object to unreference
     */
    var _unreference = function (self, objs) {

        for (var i = 0; i < objs.length; i++) {
            if (objs[i].hasOwnProperty('__id__')) {
                delete objs[i]['__id__'];
            }
        }

        var _objUnreference = function(obj) {
            // 递归接引用

            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    _objUnreference(obj[i]);
                }
            }
            else {
                if (obj.hasOwnProperty('__id__')) {
                    var idx = obj['__id__'];
                    obj = objs[idx];
                }
                else {
                    for (var k in obj) {
                        _objUnreference(obj[k]);
                    }
                }
            }
        }

        for (var i = 0; i < objs.length; i++) {
            _objUnreference(objs[i]);
        }

        return objs;
    }

    /**
     * @param {Object} obj - The object to deserialize
     */
    var _deserializeArray = function (self, assetObj, referenceObjs) {
        var asset = _unserializeAsset(self, assetObj);

        for (var k in asset) {
            if (asset[k].hasOwnProperty('__id__')) {
                var idx = asset[k]['__id__'];
                asset[k] = referenceObjs[idx];
            }
        }

        return asset;
    };

    /**
     * @param {Object} obj - The object to unserialize
     */
    var _deserializeAsset = function (self, obj) {

        // TODO: 放到哪里？
        var ReservedWords = ['__type__', '__id__', '__classname__'];
        var asset = eval('new ' + obj.__type__ + '()');

        for (var k in obj) {
            if (ReservedWords.indexOf(k) === -1) {
                asset[k] = obj[k];
            }
        }

        return asset;
    };

    return _Deserializer;
})();

/**
 * Deserialize json string to FIRE.Asset
 * @param str {String} The serialized FIRE.Asset json string
 * @return {FIRE.Asset} The FIRE.Asset object
 */
FIRE.deserialize = function (str) {
    var deserializer = new _Deserializer(str);
    return deserializer.data;
};
