
var _Deserializer = (function () {

    function _Deserializer(data, result, editor) {
        this._editor = (typeof editor !== 'undefined') ? editor : true;

        this._idList = [];
        this._idObjList = [];
        this._idPropList = [];
        this.result = result || new Fire._DeserializeInfo();

        var jsonObj = null;
        if (typeof data === 'string') {
            jsonObj = JSON.parse(data);
        }
        else {
            jsonObj = data;
        }

        if (Array.isArray(jsonObj)) {
            var jsonList = jsonObj;
            var refCount = jsonList.length;
            this.deserializedList = new Array(refCount);
            // deserialize
            for (var i = 0; i < refCount; i++) {
                if (jsonList[i]) {
                    this.deserializedList[i] = _deserializeObject(this, jsonList[i]);
                }
            }
            this.deserializedData = refCount > 0 ? this.deserializedList[0] : [];

            //// callback
            //for (var j = 0; j < refCount; j++) {
            //    if (referencedList[j].onAfterDeserialize) {
            //        referencedList[j].onAfterDeserialize();
            //    }
            //}
        }
        else {
            this.deserializedList = new Array(1);
            this.deserializedData = jsonObj ? _deserializeObject(this, jsonObj) : null;
            this.deserializedList[0] = this.deserializedData;

            //// callback
            //if (deserializedData.onAfterDeserialize) {
            //    deserializedData.onAfterDeserialize();
            //}
        }

        // dereference
        _dereference(this);
    }

    var _dereference = function (self) {
        // 这里不采用遍历反序列化结果的方式，因为反序列化的结果如果引用到复杂的外部库，很容易堆栈溢出。
        var deserializedList = self.deserializedList;
        for (var i = 0, len = self._idList.length; i < len; i++) {
            var propName = self._idPropList[i];
            var id = self._idList[i];
            self._idObjList[i][propName] = deserializedList[id];
        }
    };

    function _deserializeObjField (self, obj, jsonObj, propName) {
        var id = jsonObj.__id__;
        if (typeof id === 'undefined') {
            var uuid = jsonObj.__uuid__;
            if (uuid) {
                self.result.uuidList.push(uuid);
                self.result.uuidObjList.push(obj);
                self.result.uuidPropList.push(propName);
            }
            else {
                obj[propName] = _deserializeObject(self, jsonObj);
            }
        }
        else {
            var dObj = self.deserializedList[id];
            if (dObj) {
                obj[propName] = dObj;
            }
            else {
                self._idList.push(id);
                self._idObjList.push(obj);
                self._idPropList.push(propName);
            }
        }
    }

    /**
     * @param {Object} serialized - The obj to deserialize, must be non-nil
     */
    var _deserializeObject = function (self, serialized) {
        var propName, prop;
        var obj = null;
        var klass = null;
        if (serialized.__type__) {
            klass = Fire.getClassByName(serialized.__type__);
            if (!klass) {
                Fire.error('[Fire.deserialize] unknown type: ' + serialized.__type__);
                return null;
            }
            // instantiate a new object
            obj = new klass();
        }
        else if (!Array.isArray(serialized)) {
            // embedded primitive javascript object
            obj = serialized;
            //// jshint -W010
            //obj = new Object();
            //// jshint +W010
        }
        else {
            // array
            obj = serialized;
            for (var i = 0; i < serialized.length; i++) {
                prop = serialized[i];
                if (typeof prop === 'object' && prop) {
                    if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                        obj[i] = _deserializeObject(self, prop);
                    }
                    else {
                        _deserializeObjField(self, obj, prop, '' + i);
                    }
                }
            }
            return serialized;
        }

        // parse property
        if (klass && Fire._isFireClass(klass)) {
            if (!klass.__props__) {
                return obj;
            }
            for (var p = 0; p < klass.__props__.length; p++) {
                propName = klass.__props__[p];
                var attrs = Fire.attr(klass, propName);
                // assume all prop in __props__ must have attr
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

                    prop = serialized[propName];
                    if (typeof prop !== 'undefined') {
                        if (typeof prop !== 'object') {
                            obj[propName] = prop;
                        }
                        else {
                            if (prop) {
                                if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                                    obj[propName] = _deserializeObject(self, prop);
                                }
                                else {
                                    _deserializeObjField(self, obj, prop, propName);
                                }
                            }
                            else {
                                obj[propName] = null;
                            }
                        }
                    }
                }
                else {
                    // always load host objects even if property not serialized
                    if (self.result.hostProp) {
                        Fire.error('not support multi host object in a file');
                        // 这里假定每个asset都有uuid，每个json只能包含一个asset，只能包含一个hostProp
                    }
                    self.result.hostProp = propName;
                }
            }
        }
        else /*javascript object instance*/ {
            for (propName in obj) {
                prop = serialized[propName];
                if (typeof prop !== 'undefined' && serialized.hasOwnProperty(propName)) {
                    if (typeof prop !== 'object') {
                        obj[propName] = prop;
                    }
                    else {
                        if (prop) {
                            if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                                obj[propName] = _deserializeObject(self, prop);
                            }
                            else {
                                _deserializeObjField(self, obj, prop, propName);
                            }
                        }
                        else {
                            obj[propName] = null;
                        }
                    }
                }
            }
        }
        return obj;
    };

    return _Deserializer;
})();

/**
 * Deserialize json to Fire.Asset
 * @param {(string|object)} data - the serialized Fire.Asset json string or json object
 * @param {Fire._DeserializeInfo} [result] - additional loading result
 * @param {boolean} [editor=true] - if false, property with Fire.EditorOnly will be discarded
 * @returns {object} the main data(asset)
 */
Fire.deserialize = function (data, result, editor) {
    Fire._isCloning = true;
    var deserializer = new _Deserializer(data, result, editor);
    Fire._isCloning = false;
    return deserializer.deserializedData;
};

/**
 * 包含反序列化时的一些信息
 * @class Fire._DeserializeInfo
 */
Fire._DeserializeInfo = function () {

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
    // * @property {Fire.Asset[]} hostObjList - the obj list whose corresponding host object needs to load
    // */
    //this.hostObjList = [];
    ///**
    // * @property {string[]} hostPropList - the corresponding field name which referenced to the host object
    // */
    //this.hostPropList = [];
};

Fire._DeserializeInfo.prototype.reset = function () {
    this.uuidList.length = 0;
    this.uuidObjList.length = 0;
    this.uuidPropList.length = 0;
    this.hostProp = '';
    //this.hostObjList.length = 0;
    //this.hostPropList.length = 0;
};

Fire._DeserializeInfo.prototype.getUuidOf = function (obj, propName) {
    for (var i = 0; i < this.uuidObjList.length; i++) {
        if (this.uuidObjList[i] === obj && this.uuidPropList[i] === propName) {
            return this.uuidList[i];
        }
    }
    return "";
};
