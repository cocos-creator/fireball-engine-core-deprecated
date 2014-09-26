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
}
Callbacks: {
    _onAfterProp: function (constructor, propName) {},
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
Fire.NonSerialized = { serializable: false };

/**
 * The EditorOnly attribute marks a variable to be serialized in editor project, but non-serialized
 * in exported products.
 * 
 * @property {object} Fire.EditorOnly
 * @see Fire.NonSerialized
 */
Fire.EditorOnly = { editorOnly: true };

/**
 * Specify that the input value must be integer in Inspector
 * @property {object} Fire.HideInInspector
 */
Fire.Integer = { type: 'int' };

/**
 * Makes a property only accept the supplied object type in Inspector.
 * If the type is derived from Fire.Asset, it will be serialized to uuid.
 * 
 * @method Fire.ObjectType
 * @param {function} constructor - the special type you want
 * @returns {object} the attribute
 */
Fire.ObjectType = function (constructor) {
    return { type: 'object', objectType: constructor };
};

/**
 * Makes a property referenced to a javascript host object which needs to load before deserialzation.
 * The property will not be serialized but will be referenced to the loaed host object while deserialzation.
 * 
 * @method Fire.HostType
 * @param {string} [typename]
 * @returns {object} the attribute
 */
Fire.HostType = function (typename) {
    return {
        type: 'host',
        hostType: typename,
        serializable: false,
        hideInInspector: true,
    };
};

///**
// * @property {object} Fire.Float
// * @deprecated - No need to define Fire.Float, you should just set default value to any number
// */
//Object.defineProperty(Fire, 'Float', { get: function () {
//    console.warn('No need to use "Fire.Float", you just need to set default value to any number');
//    return {};
//}});
///**
// * @property {object} Fire.Serializable
// * @deprecated - No need to use Fire.Serializable, all properties defined by "Class.prop" is already serializable.
// */
//Object.defineProperty(Fire, 'Serializable', { get: function () {
//    console.warn('No need to use "Fire.Serializable", all properties defined by "Class.prop" is already serializable.');
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

//Fire.range = function (min, max) {
//    return { min: min, max: max };
//};
//Fire.min = function (value) {
//    return { min: value };
//};
//Fire.max = function (value) {
//    return { max: value };
//};

