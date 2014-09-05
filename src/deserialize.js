
var _Deserializer = (function () {

    /**
     * @class
     * @param {String} str - The Json string to deserialize
     */
    function _Deserializer(data) {

        var typeVal = typeof data;
        if (typeVal === 'string') {
            this.deserializedObj = JSON.parse(data);
        }
        else if (typeVal === 'object') {
            this.deserializedObj = data;
        }
        
        if (Array.isArray(this.deserializedObj)) {

            // get the deserialized root asset object
            var deserializedAssetObj = this.deserializedObj.pop();

            // spread the deserialized object with dereference objects
            var referenceObjs = _spreadReference(this.deserializedObj);

            this.deserializedData = _deserializeArray(this, deserializedAssetObj, referenceObjs);
        }
        else {
            this.deserializedData = _deserializeAsset(this, this.deserializedObj);
        }

        this.deserializedObj = null;
    }

    /**
     * @param {Object} objs - The objects to reference
     */
    var _spreadReference = function (dereferenceObjs) {

        var _direct = function(obj) {
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    if (typeof obj[i] === 'object') {
                        obj[i] = _direct(obj[i]);
                    }
                }
                return obj;
            }

            var typeVal = typeof obj;
            if (typeVal === 'object') {
                
                if (obj.__id__ !== undefined) {
                    return dereferenceObjs[obj.__id__];
                }
                else { 
                    for (var k in obj) {
                        if (typeof obj[k] === 'object') {
                            obj[k] = _direct(obj[k]);
                        }
                    }
                    return obj;
                }
            }
            else{
                return obj;
            }
        };

        for (var i = 0, len = dereferenceObjs.length; i < len; i++) {
            _direct(dereferenceObjs[i]);
        }

        return dereferenceObjs;
    };

    /**
     * @param {Object} obj - The object to deserialize
     */
    var _deserializeArray = function (self, assetObj, referenceObjs) {

        // a recursive function to refer asset root object with reference objects
        var _direct = function(obj) {

            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    if (typeof obj[i] === 'object') {
                        obj[i] = _direct(obj[i]);
                    }
                }
                return obj;
            }

            var typeVal = typeof obj;
            if (typeVal === 'object') {
                if (obj.__id__ !== undefined) {
                    return referenceObjs[obj.__id__];
                }
                else { 
                    for (var k in obj) {
                        if (typeof obj[k] === 'object') {
                            obj[k] = _direct(obj[k]);
                        }
                    }
                    return obj;
                }
            }
            else{
                return obj;
            }

        };

        assetObj = _direct(assetObj);
        var asset = _deserializeAsset(self, assetObj);

        return asset;
    };

    /**
     * @param {Object} serialized - The obj to deserialize
     */
    var _deserializeAsset = function (self, serialized) {
        var klass = FIRE.getClassByName(serialized.__type__);
        var asset = new klass();

        // TODO: check FIRE._isDefinedClass(klass) and __props__
        for (var k in serialized) {
            if (serialized.hasOwnProperty(k) && k != '__type__'/* && k != '__id__'*/) {
                asset[k] = serialized[k];
            }
        }

        return asset;
    };

    return _Deserializer;
})();

/**
 * Deserialize json string to FIRE.Asset
 * @param {(string|object)} data The serialized FIRE.Asset json string or object
 * @return {FIRE.Asset} The FIRE.Asset object
 */
FIRE.deserialize = function (data) {
    var deserializer = new _Deserializer(data);
    return deserializer.deserializedData;
};
