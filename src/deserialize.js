
var _Deserializer = (function () {
    /**
     * @param {boolean} isEditor - if false, property with Fire.EditorOnly will be discarded
     */
    function _Deserializer(jsonObj, result, target, isEditor, classFinder) {
        this._editor = isEditor;
        this._classFinder = classFinder;
        // @ifndef PLAYER
        this._target = target;
        // @endif
        this._idList = [];
        this._idObjList = [];
        this._idPropList = [];
        this.result = result || new Fire._DeserializeInfo();

        if (Array.isArray(jsonObj)) {
            var jsonArray = jsonObj;
            var refCount = jsonArray.length;
            this.deserializedList = new Array(refCount);
            // deserialize
            for (var i = 0; i < refCount; i++) {
                if (jsonArray[i]) {
                    var mainTarget;
                    // @ifndef PLAYER
                    mainTarget = (i === 0 && target);
                    // @endif
                    this.deserializedList[i] = _deserializeObject(this, jsonArray[i], mainTarget);
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
            this.deserializedList = [null];
            this.deserializedData = jsonObj ? _deserializeObject(this, jsonObj, target) : null;
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

    function _deserializeObjField (self, obj, jsonObj, propName, target) {
        var id = jsonObj.__id__;
        if (typeof id === 'undefined') {
            var uuid = jsonObj.__uuid__;
            if (uuid) {
                // @ifndef PLAYER
                if (target && target[propName] && target[propName]._uuid === uuid) {
                    return;
                }
                // @endif
                self.result.uuidList.push(uuid);
                self.result.uuidObjList.push(obj);
                self.result.uuidPropList.push(propName);
            }
            else {
                // @ifdef PLAYER
                obj[propName] = _deserializeObject(self, jsonObj);
                // @endif
                // @ifndef PLAYER
                obj[propName] = _deserializeObject(self, jsonObj, target && target[propName]);
                // @endif
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
                            // @ifdef PLAYER
                            instance[propName] = _deserializeObject(self, prop);
                            // @endif
                            // @ifndef PLAYER
                            instance[propName] = _deserializeObject(self, prop, self._target && instance[propName]);
                            // @endif
                        }
                        else {
                            // @ifdef PLAYER
                            _deserializeObjField(self, instance, prop, propName);
                            // @endif
                            // @ifndef PLAYER
                            _deserializeObjField(self, instance, prop, propName, self._target && instance);
                            // @endif
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
     * @param {object} serialized - The obj to deserialize, must be non-nil
     * @param {object} [target=null]
     */
    var _deserializeObject = function (self, serialized, target) {
        var propName, prop;
        var obj = null;
        var klass = null;
        if (serialized.__type__) {
            klass = self._classFinder(serialized.__type__);
            if (!klass) {
                Fire.error('[Fire.deserialize] unknown type: ' + serialized.__type__);
                return null;
            }
            // @ifdef PLAYER
            // instantiate a new object
            obj = new klass();
            // @endif
            // @ifndef PLAYER
            if (target) {
                // use target
                if ( !(target instanceof klass) ) {
                    Fire.warn('Type of target to deserialize not matched with data: target is %s, data is %s',
                               JS.getClassName(target), klass);
                }
                obj = target;
            }
            else {
                obj = new klass();
            }
            // @endif
        }
        else if (!Array.isArray(serialized)) {
            // embedded primitive javascript object
            // @ifdef PLAYER
            obj = serialized;
            // @endif
            // @ifndef PLAYER
            obj = target || serialized;
            //for (var key in serialized) {
            //    obj[key] = serialized[key];
            //
            //}
            // @endif
        }
        else {
            // array
            // @ifdef PLAYER
            obj = serialized;
            // @endif
            // @ifndef PLAYER
            if (target) {
                target.length = serialized.length;
                obj = target;
            }
            else {
                obj = serialized;
            }
            // @endif
            for (var i = 0; i < serialized.length; i++) {
                prop = serialized[i];
                if (typeof prop === 'object' && prop) {
                    if (!prop.__uuid__ && typeof prop.__id__ === 'undefined') {
                        // @ifdef PLAYER
                        obj[i] = _deserializeObject(self, prop);
                        // @endif
                        // @ifndef PLAYER
                        obj[i] = _deserializeObject(self, prop, target && target[i]);
                        // @endif
                    }
                    else {
                        // @ifdef PLAYER
                        _deserializeObjField(self, obj, prop, '' + i);
                        // @endif
                        // @ifndef PLAYER
                        _deserializeObjField(self, obj, prop, '' + i, target && target[i]);
                        // @endif
                    }
                }
                // @ifndef PLAYER
                else if (target) {
                    obj[i] = serialized[i];
                }
                // @endif
            }
            return obj;
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
                var rawType = attrs.rawType;
                if (!rawType) {
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
                                    // @ifdef PLAYER
                                    obj[propName] = _deserializeObject(self, prop);
                                    // @endif
                                    // @ifndef PLAYER
                                    obj[propName] = _deserializeObject(self, prop, target && target[propName]);
                                    // @endif
                                }
                                else {
                                    // @ifdef PLAYER
                                    _deserializeObjField(self, obj, prop, propName);
                                    // @endif
                                    // @ifndef PLAYER
                                    _deserializeObjField(self, obj, prop, propName, target && obj);
                                    // @endif
                                }
                            }
                            else {
                                obj[propName] = null;
                            }
                        }
                    }
                }
                else {
                    // always load raw objects even if property not serialized
                    if (self.result.rawProp) {
                        Fire.error('not support multi raw object in a file');
                        // 这里假定每个asset都有uuid，每个json只能包含一个asset，只能包含一个rawProp
                    }
                    self.result.rawProp = propName;
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
 * @param {object} [options=null]
 * @return {object} the main data(asset)
 */
Fire.deserialize = function (data, result, options) {
    var isEditor = (options && 'isEditor' in options) ? options.isEditor : Fire.isEditor;
    var classFinder = (options && options.classFinder) || JS._getClassById;
    var createAssetRefs = (options && options.createAssetRefs) || Fire.isEditorCore;
    var target;
    // @ifndef PLAYER
    target = (options && options.target);
    // @endif

    // @ifndef PLAYER
    if (Fire.isNode && Buffer.isBuffer(data)) {
        data = data.toString();
    }
    // @endif

    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    if (createAssetRefs && !result) {
        result = new Fire._DeserializeInfo();
    }

    Fire._isCloning = true;
    var deserializer = new _Deserializer(data, result, target, isEditor, classFinder);
    Fire._isCloning = false;

    if (createAssetRefs) {
        result.assignAssetsBy(Fire.serialize.asAsset);
    }

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

    // raw objects need to load
    // (不用存rawList因为它的uuid可以从asset上获得)

    /**
     * @property {string} rawProp - the corresponding field name which referenced to the raw object
     */
    this.rawProp = '';
    ///**
    // * @property {Fire.Asset[]} rawObjList - the obj list whose corresponding raw object needs to load
    // */
    //this.rawObjList = [];
    ///**
    // * @property {string[]} rawPropList - the corresponding field name which referenced to the raw object
    // */
    //this.rawPropList = [];
};

Fire._DeserializeInfo.prototype.reset = function () {
    this.uuidList.length = 0;
    this.uuidObjList.length = 0;
    this.uuidPropList.length = 0;
    this.rawProp = '';
    //this.rawObjList.length = 0;
    //this.rawPropList.length = 0;
};

Fire._DeserializeInfo.prototype.getUuidOf = function (obj, propName) {
    for (var i = 0; i < this.uuidObjList.length; i++) {
        if (this.uuidObjList[i] === obj && this.uuidPropList[i] === propName) {
            return this.uuidList[i];
        }
    }
    return "";
};

Fire._DeserializeInfo.prototype.assignAssetsBy = function (callback) {
    for (var i = 0, len = this.uuidList.length; i < len; i++) {
        var uuid = this.uuidList[i];
        var asset = callback(uuid);
        if (asset) {
            var obj = this.uuidObjList[i];
            var prop = this.uuidPropList[i];
            obj[prop] = asset;
        }
        else {
            Fire.error('Failed to assign asset: ' + uuid);
        }
    }
};
