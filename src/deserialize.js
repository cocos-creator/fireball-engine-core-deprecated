
var _Deserializer = (function () {

    /**
     * @class
     * @param {String} str - The Json string to deserialize
     */
    function _Deserializer(data) {

        var typeVal = typeof data;
        if (typeVal === 'string') {
            this.obj = JSON.parse(data);
        }
        else if (typeVal === 'object') {
            this.obj = data;
        }
        
        if (Array.isArray(this.obj)) {
            var assetObj = this.obj.pop();
            var objs = _unreference(this.obj);
            this.data = _deserializeArray(this, assetObj, objs);
        }
        else {
            this.data = _deserializeAsset(this, this.obj);
        }

        this.obj = null;
    };

    /**
     * @param {Object} obj - The object to unreference
     */
    var _unreference = function (objs) {

        var _unrefer = function(obj) {
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    if (typeof obj[i] === 'object') {
                        obj[i] = _unrefer(obj[i]);
                    }
                }
                return obj;
            }

            var typeVal = typeof obj;
            if (typeVal === 'object') {
                
                if (obj.hasOwnProperty('__id__')) {
                    return objs[obj['__id__']];
                }
                else { 
                    for (var k in obj) {
                        if (typeof obj[k] === 'object') {
                            obj[k] = _unrefer(obj[k]);
                        }
                    }
                    return obj;
                }
            }
            else{
                return obj;
            }
        };

        for (var i = 0, len = objs.length; i < len; i++) {
            _unrefer(objs[i]);
        }

        return objs;
    };

    /**
     * @param {Object} obj - The object to deserialize
     */
    var _deserializeArray = function (self, assetObj, referenceObjs) {
        var asset = _deserializeAsset(self, assetObj);

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

        // TODO: need refactor
        var ReservedWords = ['__type__', '__id__'];

        // TODO: get class from register container
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
 * @param data {String} or {Object} The serialized FIRE.Asset json string or object
 * @return {FIRE.Asset} The FIRE.Asset object
 */
FIRE.deserialize = function (data) {
    var deserializer = new _Deserializer(data);
    return deserializer.data;
};
