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
 * 
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
 * 
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

var _nameToClass = {};

/**
 * Set the name of a class
 * @method Fire.registerClass
 * @param {string} className
 * @param {function} constructor
 */
Fire.registerClass = function (className, constructor) {
    constructor.prototype.__classname__ = className;
    // register class
    if (className) {
        var registered = _nameToClass[className];
        if (registered && registered !== constructor) {
            console.error('A Class already exists with that name: "' + className + '".\
 (这个错误可能是单元测试未通过引起的.) \
If you dont need serialization, you can set class name to "". You can also call \
Fire.undefine or Fire.unregisterClass to remove the name of unused class');
        }
        _nameToClass[className] = constructor;
    }
};

/**
 * Unregister the classes extended by Fire.extend. If you dont need it anymore, 
 * you'd better unregister it to reduce memory usage.
 * Please note that its still your responsibility to free other references to the class.
 *
 * @method Fire.unregisterClass
 * @param {function} constructor
 *
 * @private
 */
Fire.unregisterClass = function (constructor) {
    var className = constructor.prototype.__classname__;
    if (className) {
        delete _nameToClass[className];
    }
};

/**
 * Get the registered class by name
 * @method Fire.getClassByName
 * @param {string} className
 * @returns {function} constructor
 */
Fire.getClassByName = function (className) {
    return _nameToClass[className];
};

// TODO getClassById

// logs

Fire.log = function () {
    console.log.apply(console, arguments);
};
// hint 无法使用 format 功能，这里不太统一，因此留给上层应用去实现。
//Fire.hint = function (text) {
//    console.log('%c' + text, "color: blue");
//};
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
