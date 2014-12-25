
var _Deserializer = (function () {

    function _Deserializer(jsonObj, result, isEditor, classFinder) {
        this._editor = isEditor;
        this._classFinder = classFinder;

        this._idList = [];
        this._idObjList = [];
        this._idPropList = [];
        this.result = result || new Fire._DeserializeInfo();

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

    function _deserializePrimitiveObject (self, instance, serialized) {
        for (var propName in instance) {    // 遍历 instance，如果具有类型，才不会把 __type__ 也读进来
            var prop = serialized[propName];
            if (typeof prop !== 'undefined' && serialized.hasOwnProperty(propName)) {
                if (typeof prop !== 'object') {
                    instance[propName] = prop;
                }
                else {
                    if (prop) {
                        if ( !prop.__uuid__ && typeof prop.__id__ === 'undefined' ) {
                            instance[propName] = _deserializeObject(self, prop);
                        }
                        else {
                            _deserializeObjField(self, instance, prop, propName);
                        }
                    }
                    else {
                        instance[propName] = null;
                    }
                }
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
            klass = self._classFinder(serialized.__type__);
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
            var props = klass.__props__;
            if (!props) {
                return obj;
            }
            for (var p = 0; p < props.length; p++) {
                propName = props[p];
                var attrs = Fire.attr(klass, propName);
                // assume all prop in __props__ must have attr
                var hostType = attrs.hostType;
                if (!hostType) {
                    if (attrs.serializable === false) {
                        continue;   // skip nonSerialized
                    }
                    if (!self._editor && attrs.editorOnly) {
                        continue;   // skip editor only if not editor
                    }
                    prop = serialized[propName];
                    if (typeof prop !== 'undefined') {
                        if (typeof prop !== 'object') {
                            obj[propName] = prop;
                        }
                        else {
                            if (prop) {
                                if ( !prop.__uuid__ && typeof prop.__id__ === 'undefined' ) {
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
            if (props[props.length - 1] === '_$erialized') {
                // save original serialized data
                obj._$erialized = serialized;
                // parse the serialized data as primitive javascript object, so its __id__ will be dereferenced
                _deserializePrimitiveObject(self, obj._$erialized, serialized);
            }
        }
        else {
            _deserializePrimitiveObject(self, obj, serialized);
        }
        return obj;
    };

    return _Deserializer;
})();

/**
 * Deserialize json to Fire.Asset
 * @param {(string|object)} data - the serialized Fire.Asset json string or json object.
 *                                 Note: If data is an object, it will be modified.
 * @param {Fire._DeserializeInfo} [result] - additional loading result
 * @param {boolean} [isEditor=true] - if false, property with Fire.EditorOnly will be discarded
 * @param {object} [options=null]
 * @returns {object} the main data(asset)
 */
Fire.deserialize = function (data, result, isEditor, options) {
    isEditor = (typeof isEditor !== 'undefined') ? isEditor : true;
    var classFinder = (options && options.classFinder) || Fire.getClassByName;
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    // @ifndef PLAYER
    if (Fire.isNode && Buffer.isBuffer(data)) {
        data = data.toString();
    }
    // @endif

    Fire._isCloning = true;
    var deserializer = new _Deserializer(data, result, isEditor, classFinder);
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
