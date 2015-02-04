/**
 * Tag the class with any meta attributes, then return all current attributes assigned to it.
 * This function holds only the attributes, not their implementations.
 *
 * @method Fire.attr
 * @param {function} constructor - the class
 * @param {string} propertyName - the name of property or function, used to retrieve the attributes
 * @param {object} [attributes] - the attribute table to mark, new attributes will merged with existed attributes.
 *                                Attribute whose key starts with '_' will be ignored.
 * @returns {object|undefined} return all attributes associated with the property. if none undefined will be returned
 *
 * @example
 * var klass = function () { this.value = 0.5 };
 * Fire.attr(klass, 'value');              // return undefined
 * Fire.attr(klass, 'value', {}).min = 0;  // assign new attribute table associated with 'value', and set its min = 0
 * Fire.attr(klass, 'value', {             // set values max and default
 *     max: 1,
 *     default: 0.5,
 * });
 * Fire.attr(klass, 'value');              // return { default: 0.5, min: 0, max: 1 }
 */
Fire.attr = function (constructor, propertyName, attributes) {
    var key = '_attr$' + propertyName;
    var attrs = constructor.prototype[key];
    if (attributes) {
        // set
        if (!attrs) {
            attrs = {};
            constructor.prototype[key] = attrs;
        }
        for (var name in attributes) {
            if (name[0] !== '_') {
                attrs[name] = attributes[name];
            }
        }
    }
    return attrs;
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
 *
 * @property {object} Fire.NonSerialized
 * @see Fire.EditorOnly
 */
Fire.NonSerialized = {
    serializable: false,
    _canUsedInGetter: false,
};

/**
 * The EditorOnly attribute marks a variable to be serialized in editor project, but non-serialized
 * in exported products.
 *
 * @property {object} Fire.EditorOnly
 * @see Fire.NonSerialized
 */
Fire.EditorOnly = {
    editorOnly: true,
    _canUsedInGetter: false,
};

/**
 * Specify that the input value must be integer in Inspector.
 * Also used to indicates that the type of elements in array or the type of value in dictionary is integer.
 * @property {object} Fire.HideInInspector
 */
Fire.Integer = { type: 'int' };

/**
 * Indicates that the type of elements in array or the type of value in dictionary is double.
 * @property {object} Fire.HideInInspector
 */
Fire.Float = { type: 'float' };

Fire.SingleText = { textMode: 'single' };
Fire.MultiText = { textMode: 'multi' };

// @ifdef DEV
function getTypeChecker (type, attrName) {
    return function (constructor, mainPropName) {
        var mainPropAttrs = Fire.attr(constructor, mainPropName) || {};
        if (mainPropAttrs.type !== type) {
            Fire.warn('Can only indicate one type attribute for %s.%s.', Fire.getClassName(constructor), mainPropName);
            return;
        }
        if (!mainPropAttrs.hasOwnProperty('default')) {
            return;
        }
        var isContainer = Array.isArray(mainPropAttrs.default) || _isPlainEmptyObj_DEV(mainPropAttrs.default);
        if (isContainer) {
            return;
        }
        var defType = typeof mainPropAttrs.default;
        if (defType === type) {
            Fire.warn('No needs to indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                       attrName, Fire.getClassName(constructor), mainPropName, type);
        }
        else {
            Fire.warn('Can not indicate the "%s" attribute for %s.%s, which its default value is type of %s.',
                       attrName, Fire.getClassName(constructor), mainPropName, defType);
        }
        delete mainPropAttrs.type;
    };
}
// @endif

/**
 * Indicates that the type of elements in array or the type of value in dictionary is boolean.
 * @property {object} Fire.HideInInspector
 */
Fire.Boolean = {
    type: 'boolean',
// @ifdef DEV
    _onAfterProp: getTypeChecker('boolean', 'Fire.Boolean'),
// @endif
};

/**
 * Indicates that the type of elements in array or the type of value in dictionary is string.
 * @property {object} Fire.HideInInspector
 */
Fire.String = {
    type: 'string',
// @ifdef DEV
    _onAfterProp: getTypeChecker('string', 'Fire.String'),
// @endif
};

/**
 * Makes a property only accept the supplied object type in Inspector.
 * If the type is derived from Fire.Asset, it will be serialized to uuid.
 *
 * @method Fire.ObjectType
 * @param {function} ctor - the special type you want
 * @returns {object} the attribute
 */
Fire.ObjectType = function (ctor) {
    return { type: 'object', ctor: ctor };
};

/**
 * Makes a property show up as a enum in Inspector.
 *
 * @method Fire.Enum
 * @param {(string)} enumType
 * @returns {object} the enum attribute
 */
Fire.Enum = function (enumType) {
    return { type: 'enum', enumList: Fire.getEnumList(enumType) };
};

/**
 * Makes a property show up as a enum in Inspector.
 *
 * @method Fire.EnumList
 * @param {(array)} enumList
 * @returns {object} the enum attribute
 */
Fire.EnumList = function (enumList) {
    return { type: 'enum', enumList: enumList };
};

/**
 * Makes a property referenced to a javascript host object which needs to load before deserialzation.
 * The property will not be serialized but will be referenced to the loaded host object while deserialzation.
 *
 * @method Fire.RawType
 * @param {string} [typename]
 * @returns {object} the attribute
 */
Fire.RawType = function (typename) {
    var NEED_EXT_TYPES = ['image', 'json', 'text', 'audio'];  // the types need to specify exact extname
    return {
        type: 'raw',
        rawType: typename,
        serializable: false,
        hideInInspector: true,
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
                    var type = attrs.type;
                    if (type === 'raw') {
                        var containsUppercase = (attrs.rawType.toLowerCase() !== attrs.rawType);
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

///**
// * @property {object} Fire.Float
// * @deprecated - No need to define Fire.Float, you should just set default value to any number
// */
//Object.defineProperty(Fire, 'Float', { get: function () {
//    Fire.warn('No need to use "Fire.Float", you just need to set default value to any number');
//    return {};
//}});
///**
// * @property {object} Fire.Serializable
// * @deprecated - No need to use Fire.Serializable, all properties defined by "Class.prop" is already serializable.
// */
//Object.defineProperty(Fire, 'Serializable', { get: function () {
//    Fire.warn('No need to use "Fire.Serializable", all properties defined by "Class.prop" is already serializable.');
//    return {};
//}});

/**
 * Makes a custom property
 *
 * @method Fire.Custom
 * @param {(string)} name
 * @returns {object} the enum attribute
 */
Fire.Custom = function (type) {
    return { custom: type };
};

/**
 * Makes a property not show up in the Inspector but be serialized.
 *
 * @property {object} Fire.HideInInspector
 */
Fire.HideInInspector = { hideInInspector: true };

/**
 * Set a custom property name for display in the editor
 *
 * @method Fire.DisplayName
 * @param {string} name
 * @returns {object} the attribute
 */
Fire.DisplayName = function (name) {
    return { displayName: name };
};

/**
 * The ReadOnly attribute indicates that the property field is disabled in Inspector.
 * @property {object} Fire.ReadOnly
 */
Fire.ReadOnly = {
    readOnly: true
};

/**
 * Specify a tooltip for a property
 *
 * @method Fire.Tooltip
 * @param {string} tooltip
 * @returns {object} the attribute
 */
Fire.Tooltip = function (tooltip) {
    return { tooltip: tooltip };
};

/**
 * @param {string} boolPropName
 * @param {boolean} hasValueByDefault
 * @returns {object} the attribute
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
 * @param {string[]|string} names - the name of target property to watch, array is also acceptable.
 * @param {function} callback - the callback function to invoke when target property(s) is changed.
 * @returns {object} the attribute
 */
Fire.Watch = function (names, callback) {
    return {
        watch: [].concat(names),  // array of property name to watch
        watchCallback: callback,
    };
};

/**
 * @param {number|null} min: null mins infinite
 * @param {number|null} max: null mins infinite
 * @returns {object} the attribute
 */
Fire.Range = function (min, max) {
   return { min: min, max: max };
};
