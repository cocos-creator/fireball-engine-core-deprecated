function _isDomNode(obj) {
    return (
        typeof Node === "object" ? obj instanceof Node : 
        obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
    );
}

var _Serializer = (function () {
    /**
     * @class
     * @param {FIRE.FObject} obj - The object to serialize
     */
    function _Serializer(obj) {
        this.serializedList = [];  // list of serialized data for all FIRE.FObject objs
        this._parsingObjs = [];    // 记录当前引用对象，防止循环引用
        this._parsingData = [];    // 记录当前引用对象的序列化结果
        this._referencedObjs = []; // 序列化过程中引用过的对象

        this.serializedList.push(_serializeObj(this, obj));

        for (var i = 0; i < this._referencedObjs.length; ++i) {
            delete this._referencedObjs[i].__id__;     // delete temp id
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
                var element = obj[i];
                var type = typeof element;
                if (type === 'object') {
                    data.push(_serializeObj(self, element));
                }
                else if (type === 'function') {
                    data.push(null);
                }
                else {
                    data.push(element);
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
            for (var key in obj) {
                //console.log(key);
                if (obj.hasOwnProperty(key) === false || key === '__id__')
                    continue;

                var val = obj[key];
                var valType = typeof val;
                // TODO read attr
                if (valType === 'object') {
                    data[key] = _serializeObj(self, val);
                }
                else if (valType === 'function') {
                    data[key] = null;
                }
                else {
                    data[key] = val;
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
     * @param {Object} obj - The object to serialize
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
        if (!!obj.__id__) {
            return { __id__: obj.__id__ }; // no need to parse again
        }
        
        var referencedData = _checkCircularReference(self, obj);
        if (referencedData) {
            // already referenced
            return { __id__: obj.__id__ };
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
 * @returns {string} The json string to represent the object
 */
FIRE.serialize = function (obj) {
    var serializer = new _Serializer(obj);
    var serializedList = serializer.serializedList;
    var serializedData = serializer.serializedList.length == 1 ? serializedList[0] : serializedList;
    return JSON.stringify(serializedData, null, 4);
};
