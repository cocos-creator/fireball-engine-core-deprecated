// helper functions for defining Classes

// both getter and prop must register the name into __props__ array
var _appendProp = function (name, isGetter) {
    if (!isGetter) {
        // checks whether getter/setter defined
        var d = Object.getOwnPropertyDescriptor(this, name);
        var hasGetterOrSetter = (d && (d.get || d.set));
        if (hasGetterOrSetter) {
            console.error(FIRE.getClassName(this) + '.' + name + ' is already defined as a getter or setter!');
            return;
        }
    }

    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        else {
            console.error(FIRE.getClassName(this) + '.' + name + ' is already defined!');
        }
    }
};

/**
 * the metaclass of the "fire class" created by FIRE.define, all its static members
 * will inherited by fire class.
 */
var _metaClass = {

    /**
     * @property {string[]} class.__props__
     * @private
     */
    __props__: null,

    /**
     * Add new instance field, propertie, or method made available on the class.
     * 该方法定义的变量默认情况下都会被序列化，也会在inspector中显示。
     * 如果传入属性包含FIRE.HideInInspector则仍会序列化但不在inspector中显示。
     * 如果传入属性包含FIRE.NonSerialized则不会序列化并且不会在inspector中显示。
     * 如果传入属性包含FIRE.EditorOnly则只在编辑器下序列化，打包时不序列化。
     * 
     * @method class.prop
     * @param {string} name - the property name
     * @param {*} defaultValue - the default value
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    prop: function (name, defaultValue, attribute) {
        _appendProp.call(this, name);
        FIRE.attr(this, name, { 'default': defaultValue });

        // apply default type (NOTE: if user provide type attribute, this one will be overwrote)
        var mytype = typeof defaultValue;
        if ( mytype === 'number' ) {
            mytype = 'float';
        }
        FIRE.attr( this, name, { 'type': mytype } );

        if (attribute) {
            for (var i = 2; i < arguments.length; i++) {
                FIRE.attr(this, name, arguments[i]);
            }
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含FIRE.HideInInspector则不在inspector中显示。
     * 
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    get: function (name, getter, attribute) {
        var d = Object.getOwnPropertyDescriptor(this, name);
        if (d && d.get) {
            console.error(FIRE.getClassName(this) + ': the getter of "' + name + '" is already defined!');
            return this;
        }

        var displayInInspector = true;
        if (attribute) {
            for (var i = 2; i < arguments.length; i++) {
                var attr = arguments[i];
                FIRE.attr(this, name, attr);
                // check attributes
                if (attr.hideInInspector) {
                    displayInInspector = false;
                }
                if (attr.serializable === false || attr.editorOnly === true) {
                    console.warn('No need to use FIRE.NonSerialized or FIRE.EditorOnly for the getter of ' + 
                        FIRE.getClassName(this) + '.' + name + ', every getter is actually non-serialized.');
                }
                if (attr.hasOwnProperty('default')) {
                    console.error(FIRE.getClassName(this) + ': Can not set default value of a getter!');
                    return this;
                }
            }
        }
        FIRE.attr(this, name, FIRE.NonSerialized);

        if (displayInInspector) {
            _appendProp.call(this, name, true);
        }
        else {
            var index = this.__props__.indexOf(name);
            if (index >= 0) {
                console.error(FIRE.getClassName(this) + '.' + name + ' is already defined!');
                return this;
            }
        }
        Object.defineProperty(this.prototype, name, {
            get: getter,
            configurable: true
        });
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，除非有对应的getter否则不在inspector中显示。
     * 
     * @method class.set
     * @param {string} name - the setter property
     * @param {function} setter - the setter function
     * @returns {function} the class itself
     */
    set: function (name, setter) {
        var d = Object.getOwnPropertyDescriptor(this, name);
        if (d && d.set) {
            console.error(FIRE.getClassName(this) + ': the setter of "' + name + '" is already defined!');
            return this;
        }
        Object.defineProperty(this.prototype, name, {
            set: setter,
            configurable: true
        });
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含FIRE.HideInInspector则不在inspector中显示。
     * 
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {function} setter - the setter function
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    getset: function (name, getter, setter, attribute) {
        this.get(name, getter, attribute);
        this.set(name, setter);
        return this;
    },
};

var _createInstanceProps = function (instance, itsClass) {
    var propList = itsClass.__props__;
    if (propList) {
        for (var i = 0; i < propList.length; i++) {
            var prop = propList[i];
            var attrs = FIRE.attr(itsClass, prop);
            if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default
                instance[prop] = attrs.default;
            }
        }
    }
};

/**
 * Checks whether the constructor is created by FIRE.define
 * 
 * @method FIRE._isFireClass
 * @param {function} constructor
 * @returns {boolean}
 * @private
 */
FIRE._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

/**
 * Creates a class and returns a constructor function for instances of the class.
 * You can also creates a sub-class by supplying a baseClass parameter.
 * 通过这种方式定义出来的类，只有通过调用它的Class.prop方法声明的字段才会被序列化。
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
            isInherit = FIRE._isFireClass(baseOrConstructor);
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
    var theClass;
    if (constructor) {
        theClass = function () {
            _createInstanceProps(this, theClass);
            constructor.apply(this, arguments);
        };
    }
    else {
        theClass = function () {
            _createInstanceProps(this, theClass);
        };
    }

    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(theClass, staticMember, {
            value: _metaClass[staticMember],
            writable: staticMember === '__props__',
            enumerable: false,
        });
    }

    // isInherit
    if (isInherit) {
        FIRE.extend(theClass, baseClass);
        theClass.$super = baseClass;
    }
    FIRE.registerClass(className, theClass);

    //// nicify constructor name
    //if (className && theClass.toString) {
    //    var toString = theClass.toString;
    //    theClass.toString = function () {
    //        return _toNiceString.call(this, toString);
    //    };
    //}
    return theClass;
};

/**
 * If you dont need a class (which defined by FIRE.define) anymore, 
 * you'd better undefine it to reduce memory usage.
 * Please note that its still your responsibility to free other references to the class.
 * 
 * @method FIRE.undefine
 * @param {...function} [constructor] - the class you will want to undefine, any number of classes can be added
 *
 * @see FIRE.define
 */
FIRE.undefine = function (constructor) {
    for (var i = 0; i < arguments.length; i++) {
        FIRE.unregisterClass(arguments[i]);
    }
};

//_toNiceString = function (originalToString) {
//    var str = originalToString.call(this);
//    return str.replace('function ', 'function ' + FIRE.getClassName(this));
//};
