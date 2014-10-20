// helper functions for defining Classes

// both getter and prop must register the name into __props__ array
var _appendProp = function (name/*, isGetter*/) {
    //if (!isGetter) {
    //    // checks whether getter/setter defined
    //    var d = Object.getOwnPropertyDescriptor(this.prototype, name);
    //    var hasGetterOrSetter = (d && (d.get || d.set));
    //    if (hasGetterOrSetter) {
    //        Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined as a getter or setter!');
    //        return;
    //    }
    //}

    if (!this.__props__) {
        this.__props__ = [name];
    }
    else {
        var index = this.__props__.indexOf(name);
        if (index < 0) {
            this.__props__.push(name);
        }
        //else {
        //    Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
        //}
    }
};

/**
 * @param {object} obj
 * @returns {boolean} is {} ?
 */
var _isPlainEmptyObj = function (obj) {
    if (obj.constructor !== ({}).constructor) {
        return false;
    }
    var k;
    for (k in obj) {
        return false;
    }
    return true;
};

var _cloneable = function (obj) {
    return obj && typeof obj.clone === 'function' && (obj.constructor.prototype.hasOwnProperty('clone') || obj.hasOwnProperty('clone'));
};

/**
 * the metaclass of the "fire class" created by Fire.define, all its static members
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
     * 如果传入属性包含Fire.HideInInspector则仍会序列化但不在inspector中显示。
     * 如果传入属性包含Fire.NonSerialized则不会序列化并且不会在inspector中显示。
     * 如果传入属性包含Fire.EditorOnly则只在编辑器下序列化，打包时不序列化。
     * 
     * @method class.prop
     * @param {string} name - the property name
     * @param {*} defaultValue - the default value
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    prop: function (name, defaultValue, attribute) {
        'use strict';
        // check default object value
        if (typeof defaultValue === 'object' && defaultValue) {
            if (Array.isArray(defaultValue)) {
                // check array empty
                if (defaultValue.length > 0) {
                    Fire.error('Default array must be empty, set default value of ' + Fire.getClassName(this) + '.prop("' + name + 
                        '", ...) to null or [], and initialize in constructor please. (just like "this.' + 
                        name + ' = [...];")');
                    return this;
                }
            }
            else if (!_isPlainEmptyObj(defaultValue)) {
                // check cloneable
                if (!_cloneable(defaultValue)) {
                    Fire.error('Do not set default value to non-empty object, unless the object defines its own "clone" function. Set default value of ' + Fire.getClassName(this) + '.prop("' + name + 
                        '", ...) to null or {}, and initialize in constructor please. (just like "this.' + 
                        name + ' = {foo: bar};")');
                    return this;
                }
            }
        }

        // set default value
        Fire.attr(this, name, { 'default': defaultValue });

        // register property
        _appendProp.call(this, name);

        // 禁用，因为getter/setter需要动态获得类型，所以类型统一由上层处理
        //// apply default type (NOTE: if user provide type attribute, this one will be overwrote)
        //var mytype = typeof defaultValue;
        //if ( mytype === 'number' ) {
        //    mytype = 'float';
        //}
        //Fire.attr( this, name, { 'type': mytype } );

        // apply attributes
        if (attribute) {
            var onAfterProp = null;
            for (var i = 2; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // register callback
                if (attr._onAfterProp) {
                    onAfterProp = onAfterProp || [];
                    onAfterProp.push(attr._onAfterProp);
                }
            }
            // call callback
            if (onAfterProp) {
                for (var c = 0; c < onAfterProp.length; c++) {
                    onAfterProp[c](this, name);
                }
            }
        }
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
     * 
     * @method class.get
     * @param {string} name - the getter property
     * @param {function} getter - the getter function which returns the real property
     * @param {...object} attribute - additional property attributes, any number of attributes can be added
     * @returns {function} the class itself
     */
    get: function (name, getter, attribute) {
        'use strict';
        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.get) {
            Fire.error(Fire.getClassName(this) + ': the getter of "' + name + '" is already defined!');
            return this;
        }

        var displayInInspector = true;
        if (attribute) {
            for (var i = 2; i < arguments.length; i++) {
                var attr = arguments[i];
                Fire.attr(this, name, attr);
                // check attributes
                if (attr.hideInInspector) {
                    displayInInspector = false;
                }
                if (attr.serializable === false || attr.editorOnly === true) {
                    Fire.warn('No need to use Fire.NonSerialized or Fire.EditorOnly for the getter of ' + 
                        Fire.getClassName(this) + '.' + name + ', every getter is actually non-serialized.');
                }
                if (attr.hasOwnProperty('default')) {
                    Fire.error(Fire.getClassName(this) + ': Can not set default value of a getter!');
                    return this;
                }
            }
        }
        Fire.attr(this, name, Fire.NonSerialized);

        if (displayInInspector) {
            _appendProp.call(this, name/*, true*/);
        }
        else {
            var index = this.__props__.indexOf(name);
            if (index >= 0) {
                Fire.error(Fire.getClassName(this) + '.' + name + ' is already defined!');
                return this;
            }
        }
        Object.defineProperty(this.prototype, name, {
            get: getter,
            configurable: true
        });
        Fire.attr(this, name, { hasGetter: true }); // 方便 editor 做判断
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
        var d = Object.getOwnPropertyDescriptor(this.prototype, name);
        if (d && d.set) {
            Fire.error(Fire.getClassName(this) + ': the setter of "' + name + '" is already defined!');
            return this;
        }
        Object.defineProperty(this.prototype, name, {
            set: function (value) {
                if (this._observing) {
                     Object.getNotifier(this).notify({
                        type: 'update',
                        name: name,
                        oldValue: this[name]
                    });
                }

                //
                setter.call(this, value);
            },
            configurable: true
        });
        Fire.attr(this, name, { hasSetter: true }); // 方便 editor 做判断
        return this;
    },

    /**
     * 该方法定义的变量**不会**被序列化，默认会在inspector中显示。
     * 如果传入参数包含Fire.HideInInspector则不在inspector中显示。
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
            var attrs = Fire.attr(itsClass, prop);
            if (attrs && attrs.hasOwnProperty('default')) {  // getter does not have default
                var def = attrs.default;
                if (typeof def === 'object' && def) {
                    // 防止多个实例引用相同对象
                    if (def.clone) {
                        def = def.clone();
                    }
                    else if (Array.isArray(def)) {
                        def = [];
                    }
                    else {
                        def = {};
                    }
                }
                instance[prop] = def;
            }
        }
    }
};

/**
 * Checks whether the constructor is created by Fire.define
 * 
 * @method Fire._isFireClass
 * @param {function} constructor
 * @returns {boolean}
 * @private
 */
Fire._isFireClass = function (constructor) {
    return !!constructor && (constructor.prop === _metaClass.prop);
};

/**
 * Checks whether myclass is child of superclass
 * 
 * @method Fire.childof
 * @param {function} myclass
 * @param {function} superclass
 * @returns {boolean}
 */

Fire.childof = function (myclass, superclass) {
    for ( var mysuper = myclass.$super; mysuper; mysuper = mysuper.$super ) {
        if ( mysuper === superclass )
            return true;
    }
    return false;
};

/**
 * Checks whether myclass is super of childclass
 * 
 * @method Fire.childof
 * @param {function} myclass
 * @param {function} childclass
 * @returns {boolean}
 */

Fire.superof = function (myclass, childclass) {
    return Fire.childof(childclass, myclass);
};

/**
 * Creates a FireClass and returns its constructor function.
 * You can also creates a sub-class by supplying a baseClass parameter.
 * 
 * @method Fire.define
 * @param {string} className - the name of class that is used to deserialize this class
 * @param {function} [baseOrConstructor] - The base class to inherit from.
 *                                         如果你的父类不是由Fire.define定义的，那么必须传入第三个参数(constructor)，否则会被当成创建新类而非继承类。
 *                                         如果你不需要构造函数，可以传入null。
 * @param {function} [constructor] - a constructor function that is used to instantiate this class, 
 *                                   if not supplied, the constructor of base class will be called automatically
 * @param {[object[]]} instanceMembers - NYI
 * @param {[object[]]} staticMembers - NYI
 * @returns {function} the defined class
 * 
 * @see Fire.extend
 */
Fire.define = function (className, baseOrConstructor, constructor) {
    'use strict';
    // check arguments
    var isInherit = false;
    switch (arguments.length) {
        case 2:
            isInherit = Fire._isFireClass(baseOrConstructor);
            break;
        case 3:
            isInherit = true;
            break;
    }
    var baseClass;
    if (isInherit) {
        baseClass = baseOrConstructor;
    }
    else {
        constructor = baseOrConstructor;
    }

    // create a new constructor
    var fireClass;
    if (constructor) {
        // constructor provided
        fireClass = function () {
            this._observing = false;
            _createInstanceProps(this, fireClass);
            constructor.apply(this, arguments);
        };
    }
    else {
        if (isInherit) {
            // auto call base constructor
            fireClass = function () {
                this._observing = false;
                _createInstanceProps(this, fireClass);
                baseClass.apply(this, arguments);
            };
        }
        else {
            // no constructor
            fireClass = function () {
                this._observing = false;
                _createInstanceProps(this, fireClass);
            };
        }
    }

    // occupy some non-inherited static members
    for (var staticMember in _metaClass) {
        Object.defineProperty(fireClass, staticMember, {
            value: _metaClass[staticMember],
            // __props__ is writable
            writable: staticMember === '__props__',
            // __props__ is enumerable so it can be inherited by Fire.extend
            enumerable: staticMember === '__props__',
        });
    }

    // inherit
    if (isInherit) {
        Fire.extend(fireClass, baseClass);
        fireClass.$super = baseClass;
        if (baseClass.__props__) {
            // copy __props__
            var len = baseClass.__props__.length;
            fireClass.__props__ = new Array(len);
            for (var i = 0; i < len; i++) {
                fireClass.__props__[i] = baseClass.__props__[i];
            }
        }
    }
    Fire.registerClass(className, fireClass);

    //// nicify constructor name
    //if (className && fireClass.toString) {
    //    var toString = fireClass.toString;
    //    fireClass.toString = function () {
    //        return _toNiceString.call(this, toString);
    //    };
    //}
    return fireClass;
};

/**
 * If you dont need a class (which defined by Fire.define) anymore, 
 * you'd better undefine it to reduce memory usage.
 * Please note that its still your responsibility to free other references to the class.
 * 
 * @method Fire.undefine
 * @param {...function} [constructor] - the class you will want to undefine, any number of classes can be added
 *
 * @see Fire.define
 */
Fire.undefine = function (constructor) {
    'use strict';
    for (var i = 0; i < arguments.length; i++) {
        Fire.unregisterClass(arguments[i]);
    }
};

//_toNiceString = function (originalToString) {
//    var str = originalToString.call(this);
//    return str.replace('function ', 'function ' + Fire.getClassName(this));
//};

/**
 * Specially optimized define function only for internal base classes
 * @private
 */
Fire._fastDefine = function (className, constructor, attributes) {
    Fire.registerClass(className, constructor);
    constructor.__props__ = attributes;
    for (var i = 0; i < attributes.length; i++) {
        Fire.attr(constructor, attributes[i], Fire.HideInInspector);
    }
};
