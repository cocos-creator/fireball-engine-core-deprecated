FIRE.ReferenceType = function () {};

FIRE.Asset = (function () {
    var super_ = FIRE.ReferenceType;
    // constructor
    function Asset () {
        super_.call(this);
    }
    FIRE.extend(Asset, super_);
    return Asset;
})();

// obj: the obj to serialize
// referencedList: list of all ReferenceType objs
// serializedList: list of serialized data for all ReferenceType objs
var getSerializedData = function (obj, canNestObj, referencedList, serializedList) {
    // TODO: 这里的算法还是有问题，因为Array和dict都有可能相互嵌套
    var retval; // serialized object
    var entry;  // sub item
    var data;   // core data without meta info
    if (Array.isArray(obj)) {
        retval = [];
        for (var i = 0; i < obj.length; ++i) {
            entry = obj[i];
            if (typeof entry === 'object') {
                //if (canNestObj) {
                    data = getSerializedData(entry, false, referencedList, serializedList);
                    serializedList[data.id].type = getClassName(entry);  // array needs to know class type
                    retval.push(data);
                //}
                //else {
                //    retval.push(entry);
                //}
            }
            else if (typeof entry === 'function') {
                retval.push(undefined);
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
        if (obj instanceof FIRE.ReferenceType) {
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
            if (canNestObj === false && typeof entry === 'object' && Array.isArray(entry) === false) {
                // can not nest object
                data[key] = undefined;
            }
            else {
                data[key] = getSerializedData(entry, false, referencedList, serializedList);
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
    var canNestObj = (obj instanceof FIRE.ReferenceType);
    getSerializedData(obj, canNestObj, referencedList, serializedList);
    return JSON.stringify(serializedList, null, 4);
};
