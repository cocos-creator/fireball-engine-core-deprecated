// helper functions for defining Classes


/**
 * Add new instance field, propertie, or method made available on the class.
 * 这里定义的所有变量默认都会被序列化，并且都会在inspector中显示。
 * 如果传入属性包含FIRE.NonSerialized则不会序列化并且不会在inspector中显示。
 * 如果传入属性包含FIRE.HideInInspector则仍会序列化但不在inspector中显示。
 * 
 * @method class.prop
 * @param {string} name - the property name
 * @param {*} value - the default value
 * @param {...object} attribute - additional property attributes, any number of attributes can be added
 * @returns {function} the class itself
 */
var _prop = function (name, value, attribute) {
    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        else {
            console.warn(FIRE.getClassName(this) + '.prop("' + name + '", ...) is already defined!');
        }
    }

    FIRE.attr(this, name, { 'default': value });
    if (attribute) {
        for (var i = 2; i < arguments.length; i++) {
            FIRE.attr(this, name, arguments[i]);
        }
    }
    return this;
};

/*
//var builder = new PropertyBuilder(this);
//builder.prop(name, value);
// declare a special class to avoid polluting user defined class
var PropertyBuilder = (function () {

    var PropertyBuilder = function (targetClass) {
        this.targetClass = targetClass;
        if (!targetClass.__props__) {
            targetClass.__props__ = [];
        }
         * @member {string} current setting property
        this._current = '';
    };

    
    PropertyBuilder.prototype.prop = function (name, value) {
        this._current = name;
        this.targetClass.__props__.push(name);
        FIRE.attr(this.targetClass, name, { 'default': value });
        return this;
    };
    return PropertyBuilder;
})();

FIRE.PropertyBuilder = PropertyBuilder;
*/

var _assignInstanceProperties = function (instance, itsClass) {
    var propList = itsClass.__props__;
    if (propList) {
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            instance[prop] = FIRE.attr(itsClass, prop).default;
        }
    }
};

//var _isDefinedClass = function (func) {
//    return func.prop === _prop;
//};

/**
 * Creates a class and returns a constructor function for instances of the class.
 * You can also creates a sub-class by supplying a baseClass parameter.
 * 
 * @method FIRE.define
 * @param {string} className - the name of class that is used to deserialize this class
 * @param {function} [baseOrConstructor] - The base class to inherit from.
 *                                         如果你的父类不是由FIRE.define定义的，那么必须传入第三个参数(constructor)，否则会被当成创建新类而非继承类。
 *                                         如果你不需要构造函数，可以传入null。
 * @param {function} [constructor] - a constructor function that is used to instantiate this class, 
 *                                   if not supplied, the constructor of base class will be called automatically
 * @param {[object[]]} instanceMembers - NYI
 * @param {[object[]]} staticMembers - NYI
 * @returns {function} the defined class
 * 
 * @see FIRE.extend
 */
FIRE.define = function (className, baseOrConstructor, constructor) {
    // check arguments
    var isInherit = false;
    switch (arguments.length) {
        case 2:
            var defined = (baseOrConstructor.prop === _prop);
            isInherit = defined;
            break;
        case 3:
            isInherit = true;
            break;
    }
    var baseClass;
    if (isInherit) {
        baseClass = baseOrConstructor;
        if (!constructor) {
            constructor = function () {
                baseClass.apply(this, arguments);
            };
        }
    }
    else {
        constructor = baseOrConstructor;
    }
    // create a new constructor
    function theClass () {
        _assignInstanceProperties(this, theClass);
        if (constructor) {
            constructor.apply(this, arguments);
        }
    }
    // occupy the Class.prop static variable
    theClass.prop = _prop;
    //
    if (isInherit) {
        var baseProps = baseClass.__props__;
        if (baseProps) {
            // prevent inherit __props__ from base
            baseClass.__props__ = null;
        }
        FIRE.extend(className, theClass, baseClass);
        if (baseProps) {
            // restore after extended
            baseClass.__props__ = baseProps;
        }
        theClass.$super = baseClass;
    }
    else {
        FIRE.setClassName(theClass, className);
    }
    return theClass;
};

///**
// * Creates a sub-class based on the supplied baseClass parameter
// * 
// * @method FIRE.extend
// * @param {string} className - the name of class that is used to deserialize this class
// * @param {function} baseClass - the class to inherit from
// * @param {function} [constructor] - a constructor function that is used to instantiate this class, 
// *                                   if not supplied, the constructor of base class will be called automatically
// * @returns {function} the defined class
// */
//FIRE.extend = function (className, constructor) {
//    if (!constructor) {
//        constructor = function () {
//            baseClass.apply(this, arguments);
//        };
//    }
//    var theClass = FIRE.define(className, constructor);
//    FIRE.simpleExtend(className, theClass, baseClass);
//    theClass.$super = baseClass;
//    return theClass;
//};
