/**
 * Tag the class with any meta attributes, then return all current attributes assigned to it.
 * This function holds only the attributes, not their implementations.
 * 
 * @method FIRE.attr
 * @param {function} constructor - the class
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
FIRE.attr = function (constructor, propertyName, attributes) {
    var key = '_attr$' + propertyName;
    var attrs = constructor.prototype[key];
    if (attributes) {
        // set
        if (!attrs) {
            attrs = {};
            constructor.prototype[key] = attrs;
        }
        for (var name in attributes) {
            attrs[name] = attributes[name];
        }
    }
    return attrs;
};

/*
var BuiltinAttributes = {
    default: defaultValue,
};
 */

/**
 * By default, all properties declared by "Class.prop" is serializable.
 * The NonSerialized attribute marks a variable to not be serialized,
 * so you can keep a property show in the Editor and Fireball will not attempt to serialize it.
 * 
 * @property {object} FIRE.NonSerialized
 * @see FIRE.EditorOnly
 */
FIRE.NonSerialized = { serializable: false };

/**
 * The EditorOnly attribute marks a variable to be serialized in editor project, but non-serialized
 * in exported products.
 * 
 * @property {object} FIRE.EditorOnly
 * @see FIRE.NonSerialized
 */
FIRE.EditorOnly = { editorOnly: true };

/**
 * Specify that the input value must be integer in Inspector
 * @property {object} FIRE.HideInInspector
 */
FIRE.Integer = { type: 'int' };

/**
 * Makes a property only accept the supplied object type in Inspector.
 * If the type is derived from FIRE.Asset, it will be serialized to uuid.
 * 
 * @method FIRE.ObjectType
 * @param {function} constructor - the special type you want
 * @returns {object} the attribute
 */
FIRE.ObjectType = function (constructor) {
    return { type: 'object', objectType: constructor };
};

/**
 * Makes a property referenced to a javascript host object which needs to load before deserialzation.
 * The property will not be serialized but will be referenced to the loaed host object while deserialzation.
 * 
 * @method FIRE.HostType
 * @param {string} [typename]
 * @returns {object} the attribute
 */
FIRE.HostType = function (typename) {
    return {
        type: 'host',
        hostType: typename,
        serializable: false,
        hideInInspector: true,
    };
};

///**
// * @property {object} FIRE.Float
// * @deprecated - No need to define FIRE.Float, you should just set default value to any number
// */
//Object.defineProperty(FIRE, 'Float', { get: function () {
//    console.warn('No need to use "FIRE.Float", you just need to set default value to any number');
//    return {};
//}});
///**
// * @property {object} FIRE.Serializable
// * @deprecated - No need to use FIRE.Serializable, all properties defined by "Class.prop" is already serializable.
// */
//Object.defineProperty(FIRE, 'Serializable', { get: function () {
//    console.warn('No need to use "FIRE.Serializable", all properties defined by "Class.prop" is already serializable.');
//    return {};
//}});

/**
 * Makes a custom property 
 * 
 * @method FIRE.Custom
 * @param {(string)} name
 * @returns {object} the enum attribute
 */
FIRE.Custom = function (type) {
    return { custom: type };
};

/**
 * Makes a property show up as a enum in Inspector.
 * 
 * @method FIRE.Enum
 * @param {(string)} enumType
 * @returns {object} the enum attribute
 */
FIRE.Enum = function (enumType) {
    return { type: 'enum', enumList: FIRE.getEnumList(enumType) };
};

/**
 * Makes a property not show up in the Inspector but be serialized.
 * 
 * @property {object} FIRE.HideInInspector
 */
FIRE.HideInInspector = { hideInInspector: true };

/**
 * Set a custom property name for display in the editor
 * 
 * @method FIRE.DisplayName
 * @param {string} name
 * @returns {object} the attribute
 */
FIRE.DisplayName = function (name) {
    return { displayName: name };
};

/**
 * Specify a tooltip for a property
 * 
 * @method FIRE.Tooltip
 * @param {string} tooltip
 * @returns {object} the attribute
 */
FIRE.Tooltip = function (tooltip) {
    return { tooltip: tooltip };
};

//FIRE.range = function (min, max) {
//    return { min: min, max: max };
//};
//FIRE.min = function (value) {
//    return { min: value };
//};
//FIRE.max = function (value) {
//    return { max: value };
//};

