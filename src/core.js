/**
 * @method FIRE.extend
 * @param {string} className
 * @param {function} cls
 * @param {function} base - the superclass to inherit
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
 * for test only
 * @method FIRE.simpleExtend
 * @private
 * @param {function} cls
 * @param {function} base
 * @param {string} className
 * @returns {function} new created class
 */
FIRE.simpleExtend = function (base, cls, className) {
    function realClass () {
        base.apply(this, arguments);
        if (cls) {
            cls.apply(this, arguments);
        }
    }
    FIRE.extend(className, realClass, base);
    return realClass;
};

FIRE.enum = function () {
    // TODO:
};

/**
 * Get class name of the object, if object is just a {} (and which class named 'Object'), it will return null.
 * (modified from http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class)
 * @param {object} obj
 * @returns {string}
 */
FIRE.getClassName = function (obj) {
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
 * Set the name of a class (constructor)
 * @method FIRE.setClassName
 * @param {function} cls
 * @param {string} className
 */
FIRE.setClassName = function (cls, className) {
    cls.prototype.__classname__ = className;
};

/**
 * Tag the class with any meta attributes, then return all current attributes assigned to it.
 * This function holds only the attributes, not their implementations.
 * 
 * @method FIRE.attr
 * @param {function} cls - the class (constructor)
 * @param {string} propertyName - the name of property or function, used to retrieve the attributes
 * @param {object} [attributes] - the attribute table to mark, new attributes will merged with existed attributes.
 * @returns {object|undefined} return all attributes associated with the property. if none undefined will be returned
 * 
 * @example
 * var klass = function () { this.value = 0.5 };
 * FIRE.attr(klass, 'value');              // return undefined
 * FIRE.attr(klass, 'value', {}).min = 0;  // assign new attribute table associated with 'value', and set its min = 0
 * FIRE.attr(klass, 'value', {             // set values max and default
 *     max: 1,
 *     default: 0.5,
 * });
 * FIRE.attr(klass, 'value');              // return { default: 0.5, min: 0, max: 1 }
 */
FIRE.attr = function (cls, propertyName, attributes) {
    var key = propertyName + '$attr';
    var attrs = cls.prototype[key];
    if (attributes) {
        // set
        if (!attrs) {
            attrs = {};
            cls.prototype[key] = attrs;
        }
        for (var name in attributes) {
            attrs[name] = attributes[name];
        }
    }
    return attrs;
};
