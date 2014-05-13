// obj: the obj to serialize
// referencedList: list of all FIRE.FObject objs
// serializedList: list of serialized data for all FIRE.FObject objs
var _getSerializedData = function (obj, isFObject, referencedList, serializedList) {
    // TODO: 这里的算法还是有问题，因为Array和dict都有可能相互嵌套
    var retval; // serialized object
    var field;  // sub item
    var data;   // core data without meta info
    if (Array.isArray(obj)) {
        retval = [];
        for (var i = 0; i < obj.length; ++i) {
            field = obj[i];
            if (typeof field === 'object') {
                //if (isFObject) {
                    data = _getSerializedData(field, false, referencedList, serializedList);
                    retval.push(data);
                //}
                //else {
                //    retval.push(field);
                //}
            }
            else if (typeof field === 'function') {
                retval.push(null);
            }
            else {
                retval.push(field);
            }
        }
    }
    else if (typeof obj === 'object') {
        retval = {};
        data = {};
        if (obj instanceof FIRE.FObject) {
            var id = referencedList.indexOf(obj);
            if (id !== -1) {
                return { __id__ : id }; // already serialized, no need to parse again
            }
            // register new referenced object
            id = referencedList.length;
            referencedList.push(obj);
            serializedList.push(data);  // TODO: what if user nest a same dict ?
            data.__id__ = id;
            data.__type__ = FIRE.getClassName(obj);
            retval.__id__ = id;         // just return id because it is serialized in serializedList
        }
        else {
            retval = data;
        }
        for (var key in obj) {
            if ( obj.hasOwnProperty(key) === false )
                continue;

            field = obj[key];
            if (typeof field === 'function') {
                continue;
            }
            // TODO read attr
            if (isFObject === false && typeof field === 'object' && Array.isArray(field) === false) {
                // can not nest object
                data[key] = null;
            }
            else {
                data[key] = _getSerializedData(field, false, referencedList, serializedList);
            }
        }
    }
    else {
        retval = obj;
    }
    return retval;
};

// serialize asset
FIRE.serialize = function (obj) {
    var referencedList = [];
    var serializedList = [];
    var isFObject = (obj instanceof FIRE.FObject);
    _getSerializedData(obj, isFObject, referencedList, serializedList);
    return JSON.stringify(serializedList, null, 4);
};
