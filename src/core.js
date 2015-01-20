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

Fire.JS = {};

/**
 * @method Fire.addon
 * copy all properties not defined in obj from arguments[1...n]
 *
 * @param {object} obj
 * @param {...object} source
 * @returns {object} the result obj
 */
Fire.addon = function (obj) {
    'use strict';
    obj = obj || {};
    for (var i = 1, length = arguments.length; i < length; i++) {
        var source = arguments[i];
        for ( var name in source) {
            if ( obj[name] === undefined ) {
                _copyprop( name, source, obj);
            }
        }
    }
    return obj;
};

/**
 * @method Fire.mixin
 * copy all properties from arguments[1...n] to obj
 *
 * @param {object} obj
 * @param {...object} source
 * @returns {object} the result obj
 */
Fire.mixin = function (obj) {
    'use strict';
    obj = obj || {};
    for (var i = 1, length = arguments.length; i < length; i++) {
        var source = arguments[i];
        for ( var name in source) {
            _copyprop( name, source, obj);
        }
    }
    return obj;
};

/**
 * Derive the class from the supplied base class.
 * Both classes are just native javascript constructors, not created by Fire.define, so
 * usually you will want to inherit using Fire.define instead.
 *
 * @method Fire.extend
 * @param {function} cls
 * @param {function} base - the baseclass to inherit
 * @returns {function} the result class
 *
 * @see Fire.define
 */
Fire.extend = function (cls, base) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
    return cls;
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class)
 * @param {(object|function)} obj - instance or constructor
 * @returns {string}
 */
Fire.getClassName = function (obj) {
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
                    var error = 'A Class already exists with the same key: "' + id + '".';
                    // @ifdef EDITOR
                    if (!Fire.isEditor) {
                        error += ' (This may be caused by error of unit test.) \
If you dont need serialization, you can set class id to "". You can also call \
Fire.undefine or Fire.unregisterClass to remove the id of unused class';
                    }
                    // @endif
                    Fire.error(error);
                }
                else {
                    table[id] = constructor;
                }
            }
        };
    }

    /**
     * Register the class by specified id, if its classname is not defined, the class name will also be set.
     * @param {string} classId
     * @param {function} constructor
     */
    Fire._setClassId = getRegister('__cid__', _idToClass);

    var doSetClassName = getRegister('__classname__', _nameToClass);

    /**
     * Register the class by specified name
     * @method Fire.setClassName
     * @param {string} className
     * @param {function} constructor
     */
    Fire.setClassName = function (className, constructor) {
        doSetClassName(className, constructor);
        // auto set class id
        if (className && !constructor.prototype.hasOwnProperty('__cid__')) {
            Fire._setClassId(className, constructor);
        }
    };

    /**
     * Unregister the class so that Fireball-x will not keep its reference anymore.
     *
     * @method Fire.unregisterClass
     * @param {function} constructor
     *
     * @private
     */
    Fire.unregisterClass = function (constructor) {
        var classId = constructor.prototype.__cid__;
        if (classId) {
            delete _idToClass[classId];
        }
        var classname = constructor.prototype.__classname__;
        if (classname) {
            delete _nameToClass[classname];
        }
    };

    /**
     * Get the registered class by id
     * @method Fire._getClassById
     * @param {string} classId
     * @returns {function} constructor
     */
    Fire._getClassById = function (classId) {
        return _idToClass[classId];
    };

    /**
     * Get the registered class by name
     * @method Fire.getClassByName
     * @param {string} classname
     * @returns {function} constructor
     */
    Fire.getClassByName = function (classname) {
        return _nameToClass[classname];
    };

    // @ifdef EDITOR
    /**
     * Get class id of the object
     * @param {(object|function)} obj - instance or constructor
     * @returns {string}
     */
    Fire._getClassId = function (obj) {
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

    Object.defineProperty(Fire, '_registeredClassIds', {
        get: function () {
            var dump = {};
            for (var id in _idToClass) {
                dump[id] = _idToClass[id];
            }
            return dump;
        },
        set: function (value) {
            _idToClass = {};
            for (var id in value) {
                _idToClass[id] = value[id];
            }
        }
    });
    Object.defineProperty(Fire, '_registeredClassNames', {
        get: function () {
            var dump = {};
            for (var id in _nameToClass) {
                dump[id] = _nameToClass[id];
            }
            return dump;
        },
        set: function (value) {
            _nameToClass = {};
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
