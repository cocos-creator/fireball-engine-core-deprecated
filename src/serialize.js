// obj: the obj to serialize
// referencedList: list of all FIRE.FObject objs
// serializedList: list of serialized data for all FIRE.FObject objs
var _getSerializedData = function (obj, isFObject, referencedList, serializedList) {
    // TODO: 这里的算法还是有问题，因为Array和dict都有可能相互嵌套
    var retval; // serialized object
    var entry;  // sub item
    var data;   // core data without meta info
    if (Array.isArray(obj)) {
        retval = [];
        for (var i = 0; i < obj.length; ++i) {
            entry = obj[i];
            if (typeof entry === 'object') {
                //if (isFObject) {
                    data = _getSerializedData(entry, false, referencedList, serializedList);
                    serializedList[data.id].type = FIRE.getClassName(entry);  // array needs to know class type
                    retval.push(data);
                //}
                //else {
                //    retval.push(entry);
                //}
            }
            else if (typeof entry === 'function') {
                retval.push(null);
                continue;
            }
            else {
                retval.push(entry);
            }
        }
    }
    else if (typeof obj === 'object') {
        retval = {};
        data = {};
        if (obj instanceof FIRE.FObject) {
            var id = referencedList.indexOf(obj);
            if (id !== -1) {
                return { id : id };
            }
            // register new referenced object
            id = referencedList.length;
            referencedList.push(obj);
            serializedList.push( { id : id, data : data } );  // TODO: what if user nest a same dict ?
            retval.id = id;
        }
        else {
            retval.data = data;
        }
        for (var key in obj) {
            entry = obj[key];
            if (typeof entry === 'function') {
                continue;
            }
            // TODO read attr
            if (isFObject === false && typeof entry === 'object' && Array.isArray(entry) === false) {
                // can not nest object
                data[key] = null;
            }
            else {
                data[key] = _getSerializedData(entry, false, referencedList, serializedList);
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
