
var _Deserializer = (function () {

    /**
     * @class
     * @param {(string|object)} data - The Json string or object to deserialize
     * @param {boolean} [editor=true] - if false, property with FIRE.EditorOnly will be discarded
     */
    function _Deserializer(data, editor) {
        this._editor = (typeof editor !== 'undefined') ? editor : true;
        
        var jsonObj = null;
        if (typeof data === 'string') {
            jsonObj = JSON.parse(data);
        }
        else {
            jsonObj = data;
        }
        
        if (Array.isArray(jsonObj)) {
            var referencedList = jsonObj;
            // deserialize
            for (var i = 0, len = referencedList.length; i < len; i++) {
                referencedList[i] = _deserializeAsset(this, referencedList[i]);
            }
            // dereference
            referencedList = _dereference(referencedList, referencedList);
            // 
            this.deserializedData = referencedList.pop() || [];
        }
        else {
            //jsonObj = jsonObj || {};
            this.deserializedData = _deserializeAsset(this, jsonObj);
        }
    }

    /**
     * @param {object} obj - The object to dereference, must be object type, non-nil, not a reference
     * @param {object[]} referenceList - The referenced list to get reference from
     * @returns {object} the referenced object
     */
    var _dereference = function (obj, referenceList) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i] && typeof obj[i] === 'object') {
                    var id1 = obj[i].__id__;
                    if (id1 !== undefined) {
                        // set real reference
                        obj[i] = referenceList[id1];
                    }
                    else {
                        obj[i] = _dereference(obj[i], referenceList);
                    }
                }
            }
        }
        else {
            for (var k in obj) {
                var val = obj[k];
                if (val && typeof val === 'object') {
                    var id2 = val.__id__;
                    if (id2 !== undefined) {
                        obj[k] = referenceList[id2];
                    }
                    else {
                        obj[k] = _dereference(val, referenceList);
                    }
                }
            }
        }
        return obj;
    };

    /**
     * @param {Object} serialized - The obj to deserialize
     */
    var _deserializeAsset = function (self, serialized) {
        if (!serialized) {
            return null;
        }
        if (!serialized.__type__) {
            // TODO: uuid
            return serialized;
        }
        var klass = FIRE.getClassByName(serialized.__type__);
        if (!klass) {
            console.warn('FIRE.deserialize: unknown type: ' + serialized.__type__);
            return null;
            //// jshint -W010
            //asset = new Object();
            //// jshint +W010
        }

        // instantiate a new object
        var asset = new klass();
        if (!FIRE._isFireClass(klass)) {
            // primitive javascript object
            for (var k in asset) {
                if (serialized.hasOwnProperty(k)) {
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

                        var prop = serialized[propName];
                        if (prop !== undefined) {
                            // TODO: uuid
                            asset[propName] = prop;
                        }
                    }
                }
            }
            var onAfterDeserialize = asset.onAfterDeserialize;
            if (onAfterDeserialize) {
                onAfterDeserialize();
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
