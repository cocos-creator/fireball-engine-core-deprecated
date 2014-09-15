
var _Deserializer = (function () {

    function _Deserializer(data, result, editor) {
        this._editor = (typeof editor !== 'undefined') ? editor : true;
        
        this.result = result || new FIRE._DeserializeInfo();

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
            this.deserializedData = referencedList.length > 0 ? referencedList[0] : [];
        }
        else {
            //jsonObj = jsonObj || {};
            this.deserializedData = _deserializeAsset(this, jsonObj);
            this.deserializedData = _dereference(this.deserializedData, [this.deserializedData]);
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
            // embedded primitive javascript object, not asset
            for (var key in serialized) {
                var val = serialized[key];
                if (val && val.__uuid__) {
                    self.result.uuidList.push(val.__uuid__);
                    self.result.uuidObjList.push(serialized);
                    self.result.uuidPropList.push(key);
                }
            }
            return serialized;
        }
        
        var asset = null;
        var klass = null;
        klass = FIRE.getClassByName(serialized.__type__);
        if (!klass) {
            console.warn('FIRE.deserialize: unknown type: ' + serialized.__type__);
            return null;
            //// jshint -W010
            //asset = new Object();
            //// jshint +W010
        }
        // instantiate a new object
        asset = new klass();

        // parse property
        if (klass && FIRE._isFireClass(klass)) {
            if (klass.__props__) {
                for (var p = 0; p < klass.__props__.length; p++) {
                    var propName = klass.__props__[p];
                    var attrs = FIRE.attr(klass, propName);
                    var hostType = attrs.hostType;
                    if (!hostType) {
                        // skip nonSerialized
                        if (attrs.serializable === false) {
                            continue;
                        }

                        // skip editor only if not editor
                        if (!self._editor && attrs.editorOnly) {
                            continue;
                        }

                        var prop = serialized[propName];
                        if (typeof prop !== 'undefined') {        
                            asset[propName] = prop;
                            if (prop && prop.__uuid__) {
                                self.result.uuidList.push(prop.__uuid__);
                                self.result.uuidObjList.push(asset);
                                self.result.uuidPropList.push(propName);
                            }
                        }
                    }
                    else {
                        // always load host objects even if property not serialized
                        if (self.result.hostProp) {
                            console.error('not support multi host object in a file');
                            // 这里假定每个asset都有uuid，每个json只能包含一个asset，只能包含一个hostProp
                        }
                        self.result.hostProp = propName;
                    }
                }
            }
            if (asset.onAfterDeserialize) {
                asset.onAfterDeserialize();
            }
        }
        else /*javascript object instance*/ {
            for (var k in asset) {
                var v = serialized[k];
                if (typeof v !== 'undefined' && serialized.hasOwnProperty(k)) {
                    asset[k] = v;
                    if (v && v.__uuid__) {
                        self.result.uuidList.push(v.__uuid__);
                        self.result.uuidObjList.push(asset);
                        self.result.uuidPropList.push(k);
                    }
                }
            }
        }
        return asset;
    };

    return _Deserializer;
})();

/**
 * Deserialize json to FIRE.Asset
 * @param {(string|object)} data - the serialized FIRE.Asset json string or json object
 * @param {FIRE._DeserializeInfo} [result] - additional loading result
 * @param {boolean} [editor=true] - if false, property with FIRE.EditorOnly will be discarded
 * @returns {object} the main data(asset)
 */
FIRE.deserialize = function (data, result, editor) {
    var deserializer = new _Deserializer(data, result, editor);
    return deserializer.deserializedData;
};

/**
 * 包含反序列化时的一些信息
 * @class FIRE._DeserializeInfo
 */
FIRE._DeserializeInfo = function () {

    //this.urlList = [];
    //this.callbackList = [];

    // uuids(assets) need to load

    /**
     * @property {string[]} uuidList - list of the depends assets' uuid
     */
    this.uuidList = [];
    /**
     * @property {object[]} uuidObjList - the obj list whose field needs to load asset by uuid
     */
    this.uuidObjList = [];
    /**
     * @property {string[]} uuidPropList - the corresponding field name which referenced to the asset
     */
    this.uuidPropList = [];

    // host objects need to load
    // (不用存hostList因为它的uuid可以从asset上获得)

    /**
     * @property {string} hostProp - the corresponding field name which referenced to the host object
     */
    this.hostProp = '';
    ///**
    // * @property {FIRE.Asset[]} hostObjList - the obj list whose corresponding host object needs to load
    // */
    //this.hostObjList = [];
    ///**
    // * @property {string[]} hostPropList - the corresponding field name which referenced to the host object
    // */
    //this.hostPropList = [];
};

FIRE._DeserializeInfo.prototype.reset = function () {
    this.uuidList.length = 0;
    this.uuidObjList.length = 0;
    this.uuidPropList.length = 0;
    this.hostProp = '';
    //this.hostObjList.length = 0;
    //this.hostPropList.length = 0;
};
