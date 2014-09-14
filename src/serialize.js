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

        this.serializedList = [];  // list of serialized data for all FIRE.FObject objs
        this._parsingObjs = [];    // 记录当前引用对象，防止循环引用
        this._parsingData = [];    // 记录当前引用对象的序列化结果
        this._referencedObjs = []; // 序列化过程中引用过的对象

        this.serializedList.push(_serializeObj(this, obj));

        if (canBindProp) {
            for (var i = 0; i < this._referencedObjs.length; ++i) {
                this._referencedObjs[i].__id__ = undefined;
            }
        }
        else {
            for (var j = 0; j < this._referencedObjs.length; ++j) {
                delete this._referencedObjs[j].__id__;
            }
        }

        this._parsingObjs = null;
        this._parsingData = null;
        this._referencedObjs = null;
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
            self._referencedObjs.push(obj);
            var data = self._parsingData[parsingIndex];
            if (Array.isArray(obj) === false) {
                //data.__id__ = id;   // also save id in source data, just for debugging
                var className = FIRE.getClassName(obj);
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
                data.push(_serializeField(self, obj[i]));
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
            if (!FIRE._isFireClass(klass)) {
                // primitive javascript object
                for (var key in obj) {
                    //console.log(key);
                    if (obj.hasOwnProperty(key) === false || key === '__id__')
                        continue;
                    data[key] = _serializeField(self, obj[key]);
                }
            }
            else /*FireClass*/ {
                onBeforeSerialize = obj.onBeforeSerialize;
                if (onBeforeSerialize) {
                    onBeforeSerialize();
                }
                // only __props__ will be serialized
                var props = klass.__props__;
                if (props) {
                    for (var p = 0; p < props.length; p++) {
                        var propName = props[p];
                        var attrs = FIRE.attr(klass, propName);

                        // skip nonSerialized
                        if (attrs.serializable === false) {
                            continue;
                        }

                        // skip editor only when exporting
                        if (self._exporting && attrs.editorOnly) {
                            continue;
                        }

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
            return _serializeObj(self, val);
        }
        else if (type !== 'function') {
            return val;
        }
        else {
            return null;
        }
    };

    /**
     * serialize only object type
     * @param {object} obj - The object to serialize
     */
    var _serializeObj = function (self, obj) {
        //console.log(obj);
        if (!obj) {
            return null;
        }
        if (_isDomNode(obj)) {
            console.warn("" + obj + " won't be serialized");
            return null;
        }
        // has been serialized ?
        var id = obj.__id__;
        if (id) {
            return { __id__: id }; // no need to parse again
        }
        // is asset ?
        var uuid = obj._uuid;
        if (uuid) {
            return { __uuid__: uuid };
        }
        
        var referencedData = _checkCircularReference(self, obj);
        if (referencedData) {
            // already referenced
            id = obj.__id__;
            return { __id__: id };
        }

        // get data:

        var data;
        if (Array.isArray(obj)) {
            data = [];
        }
        else {  // 'object'
            data = {};
            var className = FIRE.getClassName(obj);
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

    return _Serializer;
})();

/**
 * Serialize FIRE.Asset to a json string
 * @param {FIRE.Asset} obj - The object to serialize
 * @param {boolean} [exporting=false] - if true, property with FIRE.EditorOnly will be discarded
 * @param {boolean} [canBindProp=true] - if false, temporarily binded property will be deleted, 
 *                                       may leading to performance degradations
 * @returns {string} The json string to represent the object
 */
FIRE.serialize = function (obj, exporting, canBindProp) {
    var serializer = new _Serializer(obj, exporting, canBindProp);
    var serializedList = serializer.serializedList;
    var serializedData = serializer.serializedList.length === 1 ? serializedList[0] : serializedList;
    return JSON.stringify(serializedData, null, 4);
};
