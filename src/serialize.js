function _isDomNode(obj) {
    return (
        typeof Node === "object" ? obj instanceof Node : 
        obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
    );
}

var _Serializer = (function () {

    function _Serializer(obj, exporting, canBindProp) {
        canBindProp = (typeof canBindProp !== 'undefined') ? canBindProp : true;

        this._exporting = exporting;

        this.serializedList = [];  // list of serialized data for all Fire.FObject objs
        this._parsingObjs = [];    // 记录当前引用对象，防止循环引用
        this._parsingData = [];    // 记录当前引用对象的序列化结果
        this._objsToResetId = [];

        _serializeMainObj(this, obj);

        if (canBindProp) {
            for (var i = 0; i < this._objsToResetId.length; ++i) {
                this._objsToResetId[i].__id__ = undefined;
            }
        }
        else {
            for (var j = 0; j < this._objsToResetId.length; ++j) {
                delete this._objsToResetId[j].__id__;
            }
        }

        this._parsingObjs = null;
        this._parsingData = null;
        this._objsToResetId = null;
    }

    // even array may caused circular reference, so we'd be better check it all the time, 否则就要像unity限制递归层次，有好有坏
    var _checkCircularReference = function (self, obj) {
        var parsingIndex = self._parsingObjs.indexOf(obj);
        var circularReferenced = (parsingIndex !== -1);
        if (circularReferenced) {
            // register new referenced object
            var id = self.serializedList.length;
            obj.__id__ = id;        // we add this prop dynamically to simply lookup whether an obj has been serialized.
                                    // If it will lead to performance degradations in V8, we just need to save ids to another table.
            self._objsToResetId.push(obj);
            var data = self._parsingData[parsingIndex];
            if (Array.isArray(obj) === false) {
                //data.__id__ = id;   // also save id in source data, just for debugging
                var className = Fire.getClassName(obj);
                if (className) {
                    data.__type__ = className;
                }
            }
            self.serializedList.push(data);
            return data;
        }
    };

    /**
     * @param {Object} obj - The object to serialize
     * @param {Object} data - The array or dict where serialized data to store
     * @returns {Object} The reference info used to embed to its container.
     *                   if the serialized data not contains in serializedList, then return the data directly.
     */
    var _enumerateObject = function (self, obj, data) {
        if (Array.isArray(obj)) {
            //var oldSerializedCount = self.serializedList.length;
            for (var i = 0; i < obj.length; ++i) {
                var item = _serializeField(self, obj[i]);
                if (typeof item !== 'undefined') {     // strip undefined item (dont save)
                    data.push(item);
                }
            }
            /*
            // check whether obj has been serialized to serializedList, 
            // if so, no need to serialized to data again
            var index = self.serializedList.indexOf(data, oldSerializedCount);
            if (index !== -1) {
                return { __id__: index };
            }
            */
        }
        else {
            var klass = obj.constructor;
            if (!Fire._isFireClass(klass)) {
                // primitive javascript object
                for (var key in obj) {
                    //Fire.log(key);
                    if (obj.hasOwnProperty(key) === false || (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95))    // starts with __
                        continue;
                    // undefined value (if dont save) will be stripped from JSON
                    data[key] = _serializeField(self, obj[key]);
                }
            }
            else /*FireClass*/ {
                //if (obj.onBeforeSerialize) {
                //    obj.onBeforeSerialize();
                //}
                // only __props__ will be serialized
                var props = klass.__props__;
                if (props) {
                    for (var p = 0; p < props.length; p++) {
                        var propName = props[p];
                        var attrs = Fire.attr(klass, propName);

                        // skip nonSerialized
                        if (attrs.serializable === false) {
                            continue;
                        }

                        // skip editor only when exporting
                        if (self._exporting && attrs.editorOnly) {
                            continue;
                        }

                        // undefined value (if dont save) will be stripped from JSON
                        data[propName] = _serializeField(self, obj[propName]);
                    }
                }
            }
            /*
            // check whether obj has been serialized to serializedList, 
            // if so, no need to serialized to data again
            var refId = data.__id__;
            // notEqual(refId, obj.__id__);
            if (refId !== undefined) {
                return { __id__: refId };
            }
            */
        }
        //return data;
    };

    /**
     * serialize any type
     * @param {*} val - The element to serialize
     */
    var _serializeField = function (self, val) {
        var type = typeof val;
        if (type === 'object') {
            if (val instanceof FObject) {
                var objFlags = val._objFlags;
                if (objFlags & DontSave) {
                    return undefined;
                }
                else if (self._exporting && (objFlags & EditorOnly)) {
                    return undefined;
                }
            }
            return _serializeObj(self, val);
        }
        else if (type !== 'function') {
            return val;
        }
        else /*function*/ {
            return null;
        }
    };

    /**
     * serialize only primitive object type
     * @param {object} obj - The object to serialize
     */
    var _serializePrimitiveObj = function (self, obj) {
        var data;
        if (Array.isArray(obj)) {
            data = [];
        }
        else {  // 'object'
            data = {};
            var className = Fire.getClassName(obj);
            if (className) {
                data.__type__ = className;
            }
        }

        var oldSerializedCount = self.serializedList.length;

        // mark parsing to prevent circular reference
        self._parsingObjs.push(obj);
        self._parsingData.push(data);

        _enumerateObject(self, obj, data);

        self._parsingObjs.pop();
        self._parsingData.pop();

        // check whether obj has been serialized to serializedList, 
        // if so, no need to serialized to data again
        if (self.serializedList.length > oldSerializedCount) {
            var index = self.serializedList.indexOf(data, oldSerializedCount);
            if (index !== -1) {
                return { __id__: index };
            }
        }

        // inline
        return data;
    };

    /**
     * serialize object
     * @param {object} obj - The object to serialize
     */
    var _serializeObj = function (self, obj) {
        //Fire.log(obj);
        if (!obj) {
            return null;
        }
        
        // has been serialized ?
        var id = obj.__id__;
        if (typeof id !== 'undefined') {
            return { __id__: id }; // no need to parse again
        }

        if (obj instanceof FObject) {
            // FObject
            var uuid = obj._uuid;
            if (uuid) {
                // Asset
                return { __uuid__: uuid };
            }

            // assign id for FObject
            id = self.serializedList.length;
            obj.__id__ = id;        // we add this prop dynamically to simply lookup whether an obj has been serialized.
                                    // If it will lead to performance degradations in V8, we just need to save ids to another table.
            self._objsToResetId.push(obj);

            var data = {};
            self.serializedList.push(data);

            // get FObject data
            var className = Fire.getClassName(obj);
            if (className) {
                data.__type__ = className;
            }
            _enumerateObject(self, obj, data);
            //

            return { __id__: id };
        }
        else if (_isDomNode(obj)) {
            // host obj
            //Fire.warn("" + obj + " won't be serialized");
            return null;
        }
        else {
            // check circular reference if primitive object
            // 对于原生javascript类型，只做循环引用的保护，
            // 并不保证同个对象的多处引用反序列化后仍然指向同一个对象。
            // 如果有此需求，应该继承自FObject
            var referencedData = _checkCircularReference(self, obj);
            if (referencedData) {
                // already referenced
                id = obj.__id__;
                return { __id__: id };
            }
            else {
                return _serializePrimitiveObj(self, obj);
            }
        }
    };

    /**
     * serialize main object
     * 这个方法主要是对 main object 做特殊处理，虽然和 _serializeObj 很接近，但为了
     * 避免增加 _serializeObj 的额外开销并不和它合并到一起。
     * @param {object} obj - The object to serialize
     */
    var _serializeMainObj = function (self, obj) {
        if (obj instanceof FObject) {
            var uuid = obj._uuid;
            if (typeof uuid !== 'undefined') {
                // force Asset serializable, or _serializeObj will just return { __uuid__: ... }
                obj._uuid = null;
            }

            _serializeObj(self, obj);

            if (typeof uuid !== 'undefined') {
                // restore uuid
                obj._uuid = uuid;
            }
        }
        else if (typeof obj === 'object' && obj) {
            if (_isDomNode(obj)) {
                Fire.warn("" + obj + " won't be serialized");
                self.serializedList.push(null);
                return;
            }
            
            var data;
            if (Array.isArray(obj)) {
                data = [];
            }
            else {
                data = {};
                var className = Fire.getClassName(obj);
                if (className) {
                    data.__type__ = className;
                }
            }
            
            obj.__id__ = 0;
            self._objsToResetId.push(obj);
            self.serializedList.push(data);
            _enumerateObject(self, obj, data);
        }
        else {
            self.serializedList.push(_serializeObj(self, obj));
        }
    };

    return _Serializer;
})();

/**
 * Serialize Fire.Asset to a json string
 * @param {Fire.Asset} obj - The object to serialize
 * @param {boolean} [exporting=false] - if true, property with Fire.EditorOnly will be discarded
 * @param {boolean} [canBindProp=true] - if false, temporarily binded property will be deleted, 
 *                                       may leading to performance degradations
 * @returns {string} The json string to represent the object
 */
Fire.serialize = function (obj, exporting, canBindProp) {
    var serializer = new _Serializer(obj, exporting, canBindProp);
    var serializedList = serializer.serializedList;
    var serializedData = serializedList.length === 1 ? serializedList[0] : serializedList;
    return JSON.stringify(serializedData, null, 4);
};
