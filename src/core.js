/**
 * @method FIRE.extend
 * @param {string} className
 * @param {function} cls
 * @param {function} base - the baseclass to inherit
 * @returns {function} the base class
 */
FIRE.extend = function (className, cls, base) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
    FIRE.setClassName(cls, className);
    return base;
};

/**
 * TODO: replaced with define
 * @method FIRE.simpleExtend
 * @param {function} base
 * @param {function} [cls]
 * @param {string} [className]
 * @returns {function} new created class
 */
FIRE.simpleExtend = function (base, cls, className) {
    function theClass () {
        base.apply(this, arguments);
        if (cls) {
            cls.apply(this, arguments);
        }
    }
    FIRE.extend(className, theClass, base);
    return theClass;
};

FIRE.enum = function () {
    // TODO:
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class)
 * @param {object|function} obj - instance or constructor
 * @returns {string}
 */
FIRE.getClassName = function (obj) {
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
 * @method FIRE.setClassName
 * @param {function} constructor
 * @param {string} className
 */
FIRE.setClassName = function (constructor, className) {
    constructor.prototype.__classname__ = className;
};
