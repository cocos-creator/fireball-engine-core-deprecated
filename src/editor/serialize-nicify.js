/**
 * 美化序列化
 * @class nicifyInfo
 */

var RefInfos = function () {

    this.idList = [];

    this.objList = [];

    this.keyList = [];

    this.repeatIDList = [];
};

/**
 *  nicify
 */

var nicifySerialized = function (serialized) {

    var mainObject = serialized[0];

    if (mainObject === undefined) {
        return;
    }

    var refInfos = new RefInfos();

    _traversal(mainObject, refInfos);

    var id;
    var obj;
    var key;
    var value;
    var hasRepeatID;
    var tempSelf = serialized.slice();

    // dereference
    for (var i = 0; i < refInfos.objList.length; i++) {
        id = refInfos.idList[i];
        obj = refInfos.objList[i];
        key = refInfos.keyList[i];
        value = tempSelf[id];
        hasRepeatID = refInfos.repeatIDList.indexOf(id) !== -1;
        if (hasRepeatID) {
            continue;
        }
        obj[key] = value;
        var delIdx = serialized.indexOf(value);
        serialized.splice(delIdx, 1);
    }

    // update id
    for (var j = 0; j < refInfos.objList.length; j++) {
        id = refInfos.idList[j];
        key = refInfos.keyList[j];
        obj = refInfos.objList[j];
        hasRepeatID = refInfos.repeatIDList.indexOf(id) !== -1;
        if (hasRepeatID) {
            value = tempSelf[id];
            var newIdx = serialized.indexOf(value);
            obj[key].__id__ = newIdx;
        }
    }
};

Fire._nicifySerialized = nicifySerialized;

/**
 *  traversal 
 */
var _traversal = function (obj, refInfos) {
    if (typeof obj !== 'object') {
        return;
    }
    var id;
    var element;
    var hasRepeatID;
    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            element = obj[i];
            if (!element) {
                continue;
            }
            id = element.__id__;
            if (id !== undefined) {
                hasRepeatID = refInfos.idList.indexOf(id) !== -1;
                if (hasRepeatID) {
                    refInfos.repeatIDList.push(id);
                }
                refInfos.idList.push(id);
                refInfos.keyList.push(i);
                refInfos.objList.push(obj);
            }
            _traversal(element, refInfos);
        }
    }
    else {
        for (var j in obj) {
            element = obj[j];
            if (!element) {
                continue;
            }
            id = element.__id__;
            if (id !== undefined) {
                hasRepeatID = refInfos.idList.indexOf(id) !== -1;
                if (hasRepeatID) {
                    refInfos.repeatIDList.push(id);
                }
                refInfos.idList.push(id);
                refInfos.keyList.push(j);
                refInfos.objList.push(obj);
            }
            _traversal(element, refInfos);
        }
    }
};
