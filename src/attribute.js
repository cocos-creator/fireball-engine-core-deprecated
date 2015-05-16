/**
 * Tag the class with any meta attributes, then return all current attributes assigned to it.
 * This function holds only the attributes, not their implementations.
 *
 * @method attr
 * @param {function|object} constructor - the class or instance. If instance, the attribute will be dynamic and only available for the specified instance.
 * @param {string} propertyName - the name of property or function, used to retrieve the attributes
 * @param {object} [attributes] - the attribute table to mark, new attributes will merged with existed attributes. Attribute whose key starts with '_' will be ignored.
 * @return {object|undefined} return all attributes associated with the property. if none undefined will be returned
 *
 * @example
 * ```js
 *  var myClass = function () { this.value = 0.5 };
 *  Fire.attr(myClass, 'value');         // return undefined
 *  Fire.attr(myClass, 'value', {}).min = 0;  // assign new attribute table
 *              //associated with 'value', and set its min = 0
 *  Fire.attr(myClass, 'value', {       // set values max and default
 *     max: 1,
 *     default: 0.5,
 *  });
 *  Fire.attr(myClass, 'value');  // return { default: 0.5, min: 0, max: 1 }
 * ```
 */
Fire.attr = function (constructor, propertyName, attributes) {
    var key = '_attr$' + propertyName;
    var instance, attrs, name;
    if (typeof constructor === 'function') {
        // attributes in class
        instance = constructor.prototype;
        attrs = instance[key];
        if (typeof attributes !== 'undefined') {
            // set
            if (typeof attributes === 'object') {
                if (!attrs) {
                    instance[key] = attrs = {};
                }
                for (name in attributes) {
                    if (name[0] !== '_') {
                        attrs[name] = attributes[name];
                    }
                }
            }
            else {
                instance[key] = attributes;
                return attributes;
            }
        }
        return attrs;
    }
    else {
        // attributes in instance
        instance = constructor;
        if (typeof attributes !== 'undefined') {
            // set
            if (typeof attributes === 'object') {
                if (instance.hasOwnProperty(key)) {
                    attrs = instance[key];
                }
                if (!attrs) {
                    instance[key] = attrs = {};
                }
                for (name in attributes) {
                    if (name[0] !== '_') {
                        attrs[name] = attributes[name];
                    }
                }
                return JS.addon({}, attrs, instance.constructor.prototype[key]);
            }
            else {
                instance[key] = attributes;
                return attributes;
            }
        }
        else {
            // get
            attrs = instance[key];
            if (typeof attrs === 'object') {
                return JS.addon({}, attrs, instance.constructor.prototype[key]);
            }
            else {
                return attrs;
            }
        }
    }
};

/*

BuiltinAttributes: {
    default: defaultValue,
    _canUsedInGetter: true, (default true)
    _canUsedInSetter: false, (default false) (NYI)
}
Getter or Setter: {
    hasGetter: true,
    hasSetter: true,
}
Callbacks: {
    _onAfterProp: function (constructor, propName) {},
    _onAfterGetter: function (constructor, propName) {}, (NYI)
    _onAfterSetter: function (constructor, propName) {}, (NYI)
}
 */

/**
 * By default, all properties declared by "Class.prop" is serializable.
 * The NonSerialized attribute marks a variable to not be serialized,
 * so you can keep a property show in the Editor and Fireball will not attempt to serialize it.
 * See {% crosslink EditorOnly Fire.EditorOnly %} for more details.
 *
 * @property NonSerialized
 * @type object
 * @private
 */
Fire.NonSerialized = {
    serializable: false,
    _canUsedInGetter: false
};

/**
 * The EditorOnly attribute marks a variable to be serialized in editor project, but non-serialized
 * in exported products.
 *
 * @property EditorOnly
 * @type object
 * @private
 */
Fire.EditorOnly = {
    editorOnly: true,
    _canUsedInGetter: false,
};

/**
 * Specify that the input value must be integer in Inspector.
 * Also used to indicates that the type of elements in array or the type of value in dictionary is integer.
 * @property Integer
 * @type object
 */
Fire.Integer = 'Integer';

Fire.Integer_Obsoleted = { type: 'int' };

/**
 * Indicates that the type of elements in array or the type of value in dictionary is double.
 * @property Float
 * @type object
 */
Fire.Float = 'Float';

Fire.Float_Obsoleted = { type: 'float' };

Fire.SingleText = { textMode: 'single' };
Fire.MultiText = { textMode: 'multi' };

// @ifdef DEV
function getTypeChecker (type, attrName, objectTypeCtor) {
    return function (constructor, mainPropName) {
        var mainPropAttrs = Fire.attr(constructor, mainPropName) || {};
        if (mainPropAttrs.type !== type) {
            Fire.warn('Can only indicate one type attribute for %s.%s.', JS.getClassName(constructor), mainPropName);
            return;
        }
        if (!mainPropAttrs.hasOwnProperty('default')) {
            return;
        }
        var defaultVal = mainPropAttrs.default;
        if (typeof defaultVal === 'undefined') {
            return;
        }
        var isContainer = Array.isArray(defaultVal) || _isPlainEmptyObj_DEV(defaultVal);
        if (isContainer) {
            return;
        }
        var defaultType = typeof defaultVal;
        if (defaultType === type) {
            if (type === 'object') {
                if (defaultVal && !(defaultVal instanceof objectTypeCtor)) {
                    Fire.warn('The default value of %s.%s is not instance of %s.',
                               JS.getClassName(constructor), mainPropName, JS.getClassName(objectTypeCtor));
                }
                else {
                    return;
                }
            }
            else {
                Fire.warn('No needs to indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                           attrName, JS.getClassName(constructor), mainPropName, type);
            }
        }
        else {
            Fire.warn('Can not indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                       attrName, JS.getClassName(constructor), mainPropName, defaultType);
        }
        delete mainPropAttrs.type;
    };
}
// @endif

/**
 * Indicates that the type of elements in array or the type of value in dictionary is boolean.
 * @property Boolean
 * @type
 */
Fire.Boolean = 'Boolean';

Fire.Boolean_Obsoleted = {
    type: 'boolean',
// @ifdef DEV
    _onAfterProp: getTypeChecker('boolean', 'Fire.Boolean')
// @endif
};

/**
 * Indicates that the type of elements in array or the type of value in dictionary is string.
 * @property String
 * @type object
 */
Fire.String = 'String';

Fire.String_Obsoleted = {
    type: 'string',
// @ifdef DEV
    _onAfterProp: getTypeChecker('string', 'Fire.String')
// @endif
};

// the value will be represented as a uuid string
Fire._ScriptUuid = {};

/**
 * Makes a property only accept the supplied object type in Inspector.
 * If the type is derived from Fire.Asset, it will be serialized to uuid.
 *
 * @method ObjectType
 * @param {function} typeCtor - the special type you want
 * @return {object} the attribute
 * @private
 */
Fire.ObjectType = function (typeCtor) {
    // @ifdef EDITOR
    if ( !typeCtor ) {
        Fire.warn('Argument for Fire.ObjectType must be non-nil');
        return;
    }
    if (typeof typeCtor !== 'function') {
        Fire.warn('Argument for Fire.ObjectType must be function type');
        return;
    }
    // @endif
    return {
        type: 'object',
        ctor: typeCtor,
        // @ifdef EDITOR
        _onAfterProp: function (classCtor, mainPropName) {
            var check = getTypeChecker('object', 'Fire.ObjectType', typeCtor);
            check(classCtor, mainPropName);
            // check ValueType
            var mainPropAttrs = Fire.attr(classCtor, mainPropName) || {};
            if (!Array.isArray(mainPropAttrs.default) && typeof typeCtor.prototype.clone === 'function') {
                var typename = JS.getClassName(typeCtor);
                var hasDefault = mainPropAttrs.default === null || mainPropAttrs.default === undefined;
                if ( hasDefault ) {
                    Fire.warn('%s is a ValueType, no need to specify the "type" of "%s.%s", ' +
                        'because the type information can obtain from its default value directly.',
                        typename, JS.getClassName(classCtor), mainPropName, typename);
                }
                else {
                    Fire.warn('%s is a ValueType, no need to specify the "type" of "%s.%s", ' +
                        'just set the default value to "new %s()" and it will be handled properly.',
                        typename, JS.getClassName(classCtor), mainPropName, typename);
                }
            }
        }
        // @endif
    };
};

/**
 * Makes a property show up as a enum in Inspector.
 *
 * @method Enum
 * @param {object} enumType
 * @return {object} the enum attribute
 * @private
 */
Fire.Enum = function (enumType) {
    return { type: 'enum', enumList: Fire.getEnumList(enumType) };
};

/**
 * Makes a property referenced to a javascript host object which needs to load before deserialzation.
 * The property will not be serialized but will be referenced to the loaded host object while deserialzation.
 *
 * @method RawType
 * @param {string} [typename]
 * @return {object} the attribute
 * @private
 */
Fire.RawType = function (typename) {
    var NEED_EXT_TYPES = ['image', 'json', 'text', 'audio'];  // the types need to specify exact extname
    return {
        // type: 'raw',
        rawType: typename,
        serializable: false,
        // hideInInspector: true,
        _canUsedInGetter: false,

        _onAfterProp: function (constructor, mainPropName) {
// @ifdef DEV
            // check raw object
            var checked = (function checkRawType(constructor) {
                if (! Fire.isChildClassOf(constructor, Asset)) {
                    Fire.error('RawType is only available for Assets');
                    return false;
                }
                var found = false;
                for (var p = 0; p < constructor.__props__.length; p++) {
                    var propName = constructor.__props__[p];
                    var attrs = Fire.attr(constructor, propName);
                    var rawType = attrs.rawType;
                    if (rawType) {
                        var containsUppercase = (rawType.toLowerCase() !== rawType);
                        if (containsUppercase) {
                            Fire.error('RawType name cannot contain uppercase');
                            return false;
                        }
                        if (found) {
                            Fire.error('Each asset cannot have more than one RawType');
                            return false;
                        }
                        found = true;
                    }
                }
                return true;
            })(constructor);

            if (checked) {
// @endif
                var mainPropAttr = Fire.attr(constructor, mainPropName) || {};
                var needExtname = (NEED_EXT_TYPES.indexOf(mainPropAttr.rawType) !== -1);
                if (needExtname) {
                    // declare extname field
                    constructor.prop('_rawext', '', Fire.HideInInspector);
                }
// @ifdef DEV
            }
// @endif
        }
    };
};

/**
 * Makes a custom property
 *
 * @method Custom
 * @param {string} name
 * @return {object}
 * @private
 */
Fire.Custom = function (type) {
    return { custom: type };
};

/**
 * Makes a property not show up in the Inspector but be serialized.
 * @property HideInInspector
 * @type object
 * @private
 */
Fire.HideInInspector = { hideInInspector: true };

/**
 * Set a custom property name for display in the editor
 *
 * @method Fire.DisplayName
 * @param {string} name
 * @return {object} the attribute
 * @private
 */
Fire.DisplayName = function (name) {
    return { displayName: name };
};

/**
 * The ReadOnly attribute indicates that the property field is disabled in Inspector.
 * @property ReadOnly
 * @type object
 * @private
 */
Fire.ReadOnly = {
    readOnly: true
};

/**
 * Specify a tooltip for a property
 *
 * @method Tooltip
 * @param {string} tooltip
 * @return {object} the attribute
 * @private
 */
Fire.Tooltip = function (tooltip) {
    return { tooltip: tooltip };
};

/**
 * @method Nullable
 * @param {string} boolPropName
 * @param {boolean} hasValueByDefault
 * @return {object} the attribute
 * @private
 */
Fire.Nullable = function (boolPropName, hasValueByDefault) {
    return {
        nullable: boolPropName,

        _onAfterProp: function (constructor, mainPropName) {
            // declare boolean
            constructor.prop(boolPropName, hasValueByDefault, Fire.HideInInspector);
            // copy attributes from main property
            var mainPropAttr = Fire.attr(constructor, mainPropName) || {};
            if (mainPropAttr.serializable === false) {
                Fire.attr(constructor, boolPropName, Fire.NonSerialized);
            }
            else if (mainPropAttr.editorOnly) {
                Fire.attr(constructor, boolPropName, Fire.EditorOnly);
            }
        }
    };
};

/**
 * @method Watch
 * @param {string} names - the name of target property to watch, array is also acceptable.
 * @param {function} callback - the callback function to invoke when target property(s) is changed.
 * @param {object} callback.param object - the instance object which contains watching property(s).
 * @param {object} callback.param element - the property element which displays watching property(s).
 * @return {object} the attribute
 * @private
 */
Fire.Watch = function (names, callback) {
    return {
        watch: [].concat(names),  // array of property name to watch
        watchCallback: callback
    };
};

/**
 * @method Range
 * @param {number} min: null mins infinite
 * @param {number} max: null mins infinite
 * @return {object} the attribute
 * @private
 */
Fire.Range = function (min, max) {
   return { min: min, max: max };
};
