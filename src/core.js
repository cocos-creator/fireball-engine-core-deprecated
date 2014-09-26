/**
 * @method Fire.merge
 * copy all properties from arguments[1...n] to obj 
 * 
 * @param {object} obj
 * @param 1...n {object} 
 * @returns {function} the result obj
 * 
 */
Fire.merge = function (obj) {
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

/**
 * @method Fire.extend
 * Derive the class from the supplied base class.
 * Both classes are just native javascript constructors, not created by Fire.define, so
 * usually you will want to inherit using Fire.define instead.
 * 
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
