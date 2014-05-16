var _Serializer = (function () {
    /**
     * @param obj {FIRE.FObject} The object to serialize
     */
    function _Serializer(obj) {
        this.serializedList = [];  // list of serialized data for all FIRE.FObject objs
        this._parsingObjs = [];    // 记录当前引用对象，防止循环引用
        this._parsingData = [];    // 记录当前引用对象的序列化结果
        this._referencedObjs = []; // 序列化过程中引用过的对象

        this.serializedList.push(this._serializeObj(obj));

        for (var i = 0; i < this._referencedObjs.length; ++i) {
            delete this._referencedObjs[i].__id__;     // delete temp id
        }

        this._parsingObjs = null;
        this._parsingData = null;
        this._referencedObjs = null;
    }

    // even array may caused circular reference, so we'd be better check it all the time, 否则就要像unity限制递归层次，有好有坏
    _Serializer.prototype._checkCircularReference = function (obj) {
        var parsingIndex = this._parsingObjs.indexOf(obj);
        var circularReferenced = (parsingIndex !== -1);
        if (circularReferenced) {
            // register new referenced object
            var id = this.serializedList.length;
            obj.__id__ = id;        // we use this prop to fast lookup whether an obj has been serialized
            this._referencedObjs.push(obj);
            var data = this._parsingData[parsingIndex];
            if (Array.isArray(obj) === false) {
                data.__id__ = id;   // debug only
                var className = FIRE.getClassName(obj);
                if (className) {
                    data.__type__ = className;
                }
            }
            this.serializedList.push(data);
            return data;
        }
    };

    /**
     * @param obj {Object} The object to serialize
     * @param data {Object} The array or dict where serialized data to store
     * @return {Number} If obj been referenced in serializedList, return its id, else return -1
     */
    _Serializer.prototype._getObjectData = function (obj, data) {
        var oldSerializedCount = this.serializedList.length;

        this._parsingObjs.push(obj);
        this._parsingData.push(data);
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; ++i) {
                var element = obj[i];
                var type = typeof element;
                if (type === 'object') {
                    data.push(this._serializeObj(element));
                }
                else if (type === 'function') {
                    data.push(null);
                }
                else {
                    data.push(element);
                }
            }
        }
        else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) === false || key === '__id__')
                    continue;

                var val = obj[key];
                var valType = typeof val;
                // TODO read attr
                if (valType === 'object') {
                    data[key] = this._serializeObj(val);
                }
                else if (valType === 'function') {
                    data[key] = null;
                }
                else {
                    data[key] = val;
                }
            }
        }
        this._parsingObjs.pop();
        this._parsingData.pop();

        // check whether obj is been serialized to serializedList, 
        // if it is, no need to serialized to data again
        if (this.serializedList.length > oldSerializedCount) {
            var index = this.serializedList.indexOf(data, oldSerializedCount);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    };

    /**
     * @param obj {Object} The object to serialize
     */
    _Serializer.prototype._serializeObj = function (obj) {
        // has been serialized ?
        if (!!obj.__id__) {
            return { __id__: obj.__id__ }; // no need to parse again
        }
        
        var referencedData = this._checkCircularReference(obj);
        if (referencedData) {
            // already referenced
            // this._getObjectData(obj, referencedData); 不是第一次引用，不需要重复解析数据
            return { __id__: obj.__id__ };
        }
        else {
            // embedded
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
            var id = this._getObjectData(obj, data);
            if (id === -1) {
                return data;
            }
            else {
                return { __id__: id };
            }
        }
    };

    return _Serializer;
})();

/**
 * Serialize FIRE.Asset to json string
 * @param obj {FIRE.Asset} The object to serialize
 * @return {String} The json string to represent the object
 */
FIRE.serialize = function (obj) {
    var serializer = new _Serializer(obj);
    var serializedList = serializer.serializedList;
    var serializedData = serializer.serializedList.length == 1 ? serializedList[0] : serializedList;
    return JSON.stringify(serializedData, null, 4);
};
