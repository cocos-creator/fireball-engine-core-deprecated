// helper functions for defining Classes


/**
 * Add new instance field, propertie, or method made available on the class
 * 
 * @method class.prop
 * @param {string} name - the property name
 * @param {*} value - the default value
 * @param {...object} attribute - additional property attributes, any number of attributes can be added
 * @returns {function} the class itself
 */
var _prop = function (name, value, attribute) {
    if (!this.__props__) {
        this.__props__ = [];
    }
    this.__props__.push(name);

    FIRE.attr(this, name, { 'default': value });
    if (attribute) {
        for (var i = 2; i < arguments.length; i++) {
            FIRE.attr(this, name, arguments[i]);
        }
    }
    return this;
}
var _assignInstanceProperties = function (instance, propList) {
    for (var i = 0; i < propList.length; i++) {
        var prop = propList[i];
        instance[prop] = FIRE.attr(instance.constructor, prop).default;
    }
};

/**
 * Creates a class and returns a constructor function for instances of the class.
 * 
 * @method FIRE.define
 * @param {string} className - the name of class that is used to deserialize this class
 * @param {function} [constructor] - a constructor function that is used to instantiate this class
 * @param {[object[]]} instanceMembers - NYI
 * @param {[object[]]} staticMembers - NYI
 * @returns {function} the defined class
 */
FIRE.define = function (className, constructor) {
    function theClass () {
        _assignInstanceProperties(this, theClass.__props__);
        if (constructor) {
            constructor.apply(this, arguments);
        }
    }
    FIRE.setClassName(theClass, className);
    theClass.prop = _prop;
    return theClass;
};

/**
 * Creates a sub-class based on the supplied baseClass parameter
 * 
 * @method FIRE.derive
 * @param {string} className - the name of class that is used to deserialize this class
 * @param {function} baseClass - the class to inherit from
 * @param {function} [constructor] - a constructor function that is used to instantiate this class
 * @returns {function} the defined class
 */
FIRE.derive = function (className, baseClass, constructor) {
    var theClass = FIRE.define(className, constructor);
    FIRE.extend(className, theClass, baseClass);
    theClass.$super = baseClass;
};
