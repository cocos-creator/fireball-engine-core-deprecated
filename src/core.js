/**
 * !#en Get property descriptor
 * descriptor is blah blah
 * !#zh 获取 property 的描述物体
 * 描述物体是这样的
 * @method _getPropertyDescriptor
 * @param {object} obj - !#en !#zh 获取属性的对象
 * @param {string} name
 * @return {Object}
 */
function _getPropertyDescriptor(obj, name) {
    if (obj) {
        var pd = Object.getOwnPropertyDescriptor(obj, name);
        return pd || _getPropertyDescriptor(Object.getPrototypeOf(obj), name);
    }
}

function _copyprop(name, source, target) {
    var pd = _getPropertyDescriptor(source, name);
    Object.defineProperty(target, name, pd);
}

var JS = Fire.JS = {

    /**
     * copy all properties not defined in obj from arguments[1...n]
     * @method addon
     * @param {object} obj object to extend its properties
     * @param {object} sourceObj source object to copy properties from
     * @return {object} the result obj
     */
    addon: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            for ( var name in source) {
                if ( !(name in obj) ) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * copy all properties from arguments[1...n] to obj
     * @method mixin
     * @param {object} obj
     * @param {object} source
     * @return {object} the result obj
     */
    mixin: function (obj) {
        'use strict';
        obj = obj || {};
        for (var i = 1, length = arguments.length; i < length; i++) {
            var source = arguments[i];
            if (source) {
                if (typeof source !== 'object') {
                    Fire.error('Fire.mixin called on non-object:', source);
                    continue;
                }
                for ( var name in source) {
                    _copyprop( name, source, obj);
                }
            }
        }
        return obj;
    },

    /**
     * Derive the class from the supplied base class.
     * Both classes are just native javascript constructors, not created by Fire.define, so
     * usually you will want to inherit using {% crosslink Fire.define define %} instead.
     *
     * @method extend
     * @param {function} cls
     * @param {function} base - the baseclass to inherit
     * @return {function} the result class
     */
    extend: function (cls, base) {
// @ifdef DEV
        if ( !base ) {
            Fire.error('The base class to extend from must be non-nil');
            return;
        }
        if ( !cls ) {
            Fire.error('The class to extend must be non-nil');
            return;
        }
// @endif
        for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
        function __() { this.constructor = cls; }
        __.prototype = base.prototype;
        cls.prototype = new __();
        return cls;
    },

    clear: function (obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            delete obj[keys[i]];
        }
    }
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from <a href="http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class">the code from this stackoverflow post</a>)
 * @method getClassName
 * @param {object|function} obj - instance or constructor
 * @return {string}
 */
JS.getClassName = function (obj) {
    if (typeof obj === 'function' && obj.prototype.__classname__) {
        return obj.prototype.__classname__;
    }
    if (obj && obj.constructor) {
        if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__classname__')) {
            return obj.__classname__;
        }
        var retval;
        //  for browsers which have name property in the constructor of the object, such as chrome
        if (obj.constructor.name) {
            retval = obj.constructor.name;
        }
        if (obj.constructor.toString) {
            var arr, str = obj.constructor.toString();
            if (str.charAt(0) === '[') {
                // str is "[object objectClass]"
                arr = str.match(/\[\w+\s*(\w+)\]/);
            }
            else {
                // str is function objectClass () {} for IE Firefox
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length === 2) {
                retval = arr[1];
            }
        }
        return retval !== 'Object' ? retval : null;
    }
    return null;
};

// id 注册
(function () {
    var _idToClass = {};
    var _nameToClass = {};

    function getRegister (key, table) {
        return function (id, constructor) {
            // deregister old
            if (constructor.prototype.hasOwnProperty(key)) {
                delete table[constructor.prototype[key]];
            }
            constructor.prototype[key] = id;
            // register class
            if (id) {
                var registered = table[id];
                if (registered && registered !== constructor) {
                    var error = 'A Class already exists with the same ' + key + ' : "' + id + '".';
                    // @ifdef EDITOR
                    if (!Fire.isEditor) {
                        error += ' (This may be caused by error of unit test.) \
If you dont need serialization, you can set class id to "". You can also call \
Fire.unregisterClass to remove the id of unused class';
                    }
                    // @endif
                    Fire.error(error);
                }
                else {
                    table[id] = constructor;
                }
                //if (id === "") {
                //    console.trace("", table === _nameToClass);
                //}
            }
        };
    }

    /**
     * Register the class by specified id, if its classname is not defined, the class name will also be set.
     * @method _setClassId
     * @param {string} classId
     * @param {function} constructor
     */
    JS._setClassId = getRegister('__cid__', _idToClass);

    var doSetClassName = getRegister('__classname__', _nameToClass);

    /**
     * Register the class by specified name
     * @method setClassName
     * @param {string} className
     * @param {function} constructor
     */
    JS.setClassName = function (className, constructor) {
        doSetClassName(className, constructor);
        // auto set class id
        if (className && !constructor.prototype.hasOwnProperty('__cid__')) {
            JS._setClassId(className, constructor);
        }
    };

    /**
     * If you dont need a class (which defined by Fire.define or Fire.setClassName) anymore,
     * You should unregister the class so that Fireball will not keep its reference anymore.
     * Please note that its still your responsibility to free other references to the class.
     *
     * @method unregisterClass
     * @param {function} [constructor] - the class you will want to unregister, any number of classes can be added
     */
    JS.unregisterClass = function (constructor) {
        'use strict';
        for (var i = 0; i < arguments.length; i++) {
            var p = arguments[i].prototype;
            var classId = p.__cid__;
            if (classId) {
                delete _idToClass[classId];
            }
            var classname = p.__classname__;
            if (classname) {
                delete _nameToClass[classname];
            }
        }
    };

    /**
     * Get the registered class by id
     * @method _getClassById
     * @param {string} classId
     * @return {function} constructor
     */
    JS._getClassById = function (classId) {
        var cls = _idToClass[classId];
// @ifdef EDITOR
        if (!cls) {
            if (classId.length === 32) {
                // 尝试解析旧的 uuid 压缩格式
                cls = _idToClass[Fire.compressUuid(classId)];
            }
        }
// @endif
        return cls;
    };

    /**
     * Get the registered class by name
     * @method getClassByName
     * @param {string} classname
     * @return {function} constructor
     */
    JS.getClassByName = function (classname) {
        return _nameToClass[classname];
    };

    /**
     * Get class id of the object
     * @method _getClassId
     * @param {object|function} obj - instance or constructor
     * @return {string}
     */
    JS._getClassId = function (obj) {
        if (typeof obj === 'function' && obj.prototype.__cid__) {
            return obj.prototype.__cid__;
        }
        if (obj && obj.constructor) {
            if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__cid__')) {
                return obj.__cid__;
            }
        }
        return '';
    };

    // @ifdef EDITOR
    Object.defineProperty(JS, '_registeredClassIds', {
        get: function () {
            var dump = {};
            for (var id in _idToClass) {
                dump[id] = _idToClass[id];
            }
            return dump;
        },
        set: function (value) {
            JS.clear(_idToClass);
            for (var id in value) {
                _idToClass[id] = value[id];
            }
        }
    });
    Object.defineProperty(JS, '_registeredClassNames', {
        get: function () {
            var dump = {};
            for (var id in _nameToClass) {
                dump[id] = _nameToClass[id];
            }
            return dump;
        },
        set: function (value) {
            JS.clear(_nameToClass);
            for (var id in value) {
                _nameToClass[id] = value[id];
            }
        }
    });
    // @endif
})();

// logs

Fire.log = function () {
    console.log.apply(console, arguments);
};
Fire.info = function () {
    (console.info || console.log).apply(console, arguments);
};
Fire.warn = function () {
    console.warn.apply(console, arguments);
};
if (console.error.bind) {
    // error会dump call stack，用bind可以避免dump Fire.error自己。
    Fire.error = console.error.bind(console);
}
else {
    Fire.error = function () {
        console.error.apply(console, arguments);
    };
}

// enum

Fire.defineEnum = function (obj) {
    var enumType = {};
    Object.defineProperty(enumType, '__enums__', {
        value: undefined,
        writable: true
    });

    var lastIndex = -1;
    for (var key in obj) {
        var val = obj[key];
        if (val === -1) {
            val = ++lastIndex;
        }
        else {
            lastIndex = val;
        }
        enumType[key] = val;

        var reverseKey = '' + val;
        if (key !== reverseKey) {
            Object.defineProperty(enumType, reverseKey, {
                value: key,
                enumerable: false
            });
        }
    }
    return enumType;
};

// @ifdef DEV

// check key order in object literal
var _TestEnum = Fire.defineEnum({
    ZERO: -1,
    ONE: -1,
    TWO: -1,
    THREE: -1
});
if (_TestEnum.ZERO !== 0 || _TestEnum.ONE !== 1 || _TestEnum.TWO !== 2 || _TestEnum.THREE !== 3) {
    Fire.error('Sorry, "Fire.defineEnum" not available on this platform, ' +
               'please report this error here: https://github.com/fireball-x/fireball/issues/new !');
}

// @endif
