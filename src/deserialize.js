
var _Deserializer = (function () {

    /**
     * @class
     * @param {String} str - The Json string to deserialize
     * @param {boolean} [editor=true] - if false, property with FIRE.EditorOnly will be discarded
     */
    function _Deserializer(data, editor) {
        this._editor = editor;

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

        if (!FIRE._isFireClass(klass)) {
            // primitive javascript object
            for (var k in serialized) {
                if (serialized.hasOwnProperty(k) && k != '__type__'/* && k != '__id__'*/) {
                    asset[k] = serialized[k];
                }
            }
        }
        else /*FireClass*/ {
            if (klass.__props__) {
                for (var p = 0; p < klass.__props__.length; p++) {
                    var propName = klass.__props__[p];
                    var attrs = FIRE.attr(klass, propName);

                    // always load host objects even if property not serialized
                    var hostType = attrs.hostType;
                    if (hostType) {
                        // TODO: load host object

                    }
                    else {
                        // skip nonSerialized
                        if (attrs.serializable === false) {
                            continue;
                        }

                        // skip editor only if not editor
                        if (!self._editor && attrs.editorOnly) {
                            continue;
                        }

                        if (propName in obj) {
                            // todo
                        }
                    }

                    data[propName] = _serializeField(self, obj[propName]);
                }
            }
            if (asset.onAfterDeserialize) {
                asset.onAfterDeserialize();
            }
        }

        return asset;
    };

    return _Deserializer;
})();

/**
 * Deserialize json string to FIRE.Asset
 * @param {(string|object)} data The serialized FIRE.Asset json string or object
 * @param {boolean} [editor=true] - if false, property with FIRE.EditorOnly will be discarded
 * @return {FIRE.Asset} The FIRE.Asset object
 */
FIRE.deserialize = function (data, editor) {
    var deserializer = new _Deserializer(data, editor);
    return deserializer.deserializedData;
};
