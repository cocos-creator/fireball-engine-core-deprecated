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

/**
 * Set the name of a class
 * @method Fire.setClassName
 * @param {string} className
 * @param {function} constructor
 */
Fire.setClassName = function (className, constructor) {
    constructor.prototype.__classname__ = className;
};

// id 注册
(function () {
    var _idToClass = {};

    /**
     * Register the class by specified id, if its classname is not defined, the class name will also be set.
     * @method Fire.registerClass
     * @param {string} classId
     * @param {function} constructor
     */
    Fire.registerClass = function (classId, constructor) {
        constructor.prototype.__cid__ = classId;
        // register class
        if (classId) {
            var registered = _idToClass[classId];
            if (registered && registered !== constructor) {
                var error = 'A Class already exists with the same id: "' + classId + '".';

                if ( !Fire.isEditor ) {
                    error += ' (This may be caused by error of unit test.) \
If you dont need serialization, you can set class id to "". You can also call \
Fire.undefine or Fire.unregisterClass to remove the id of unused class';
                }
                Fire.error(error);
                return;
            }
            _idToClass[classId] = constructor;
        }
        if ( !constructor.prototype.hasOwnProperty('__classname__') ) {
            Fire.setClassName(classId, constructor);
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
    };

    /**
     * Get the registered class by id
     * @method Fire.getClassById
     * @param {string} classId
     * @returns {function} constructor
     */
    Fire.getClassById = function (classId) {
        return _idToClass[classId];
    };

    // @ifdef EDITOR
    /**
     * Get class id of the object, if class id not defined, its class name will be returned.
     * @param {(object|function)} obj - instance or constructor
     * @returns {string}
     */
    Fire.getClassId = function (obj) {
        if (typeof obj === 'function' && obj.prototype.__cid__) {
            return obj.prototype.__cid__;
        }
        if (obj && obj.constructor) {
            if (obj.constructor.prototype && obj.constructor.prototype.hasOwnProperty('__cid__')) {
                return obj.__cid__;
            }
        }
        return Fire.getClassName(obj);
    };

    Object.defineProperty(Fire, '_registeredClasses', {
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
