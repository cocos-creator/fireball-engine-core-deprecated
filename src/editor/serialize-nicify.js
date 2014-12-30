/**
 * 美化序列化
 * @class nicifyInfo
 */

var _nicifyInfo = function () {

    this.idList = [];

    this.objList = [];

    this.keyList = [];

    this.repeatIDList = [];
};

/**
 *  nicify
 */

var nicifySerialized = function (self) {

    var allObj = self[0];

    if (allObj === undefined) {
        return;
    }

    var result = new _nicifyInfo();

    _traversal(allObj, result);

    var tempSelf = self.slice();

    for (var i = 0; i < result.objList.length; i++) {
        var id = result.idList[i];
        var obj = result.objList[i];
        var key = result.keyList[i];
        var value = tempSelf[id];
        if (result.repeatIDList.indexOf(id) !== -1) {
            continue;
        }
        obj[key] = value;
        var delIdx = self.indexOf(value);
        self.splice(delIdx, 1);
    }
    for (var i = 0; i < result.objList.length; i++) {
        var id = result.idList[i];
        var key = result.keyList[i];
        var obj = result.objList[i];
        if (result.repeatIDList.indexOf(id) !== -1) {
            var value = tempSelf[id];
            var newIdx = self.indexOf(value);
            obj[key].__id__ = newIdx;
        }
    }
};

/**
 *  traversal 
 */
var _traversal = function (obj, result) {
    if (typeof obj !== 'object') {
        return;
    }

    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            var element = obj[i];
            if (element === undefined || element === null) {
                continue;
            }
            if (element.__id__ !== undefined) {
                var id = element.__id__;
                if (result.idList.indexOf(id) !== -1) {
                    result.repeatIDList.push(id);
                }
                result.idList.push(id);
                result.keyList.push(i);
                result.objList.push(obj);
            }
            _traversal(element, result);
        }
    }
    else {
        for (var i in obj) {
            var element = obj[i];
            if (element === undefined || element === null) {
                continue;
            }
            if (element.__id__ !== undefined) {
                var id = element.__id__;
                if (result.idList.indexOf(id) !== -1) {
                    result.repeatIDList.push(id);
                }
                result.idList.push(id);
                result.keyList.push(i);
                result.objList.push(obj);
            }
            _traversal(element, result);
        }
    }
};
