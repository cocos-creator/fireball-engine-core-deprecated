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
    var key = propertyName + '$attr';
    var attrs = constructor.prototype[key];
    if (attributes) {
        // set
        if (!attrs) {
            attrs = {};
            constructor.prototype[key] = attrs;
        }
        // jshint forin: false
        for (var name in attributes) {
            attrs[name] = attributes[name];
        }
        // jshint forin: true
    }
    return attrs;
};

///**
// * Makes a property show up as the supplied type in Inspector.
// * @method FIRE.Type
// * @param {string} type - the type name of property, available value:
// *                        'enum', 'int'
// * @param {*} [typeOption] - additional type option, such as enum name ... etc.
// * @returns {object} the type attribute
// */
//FIRE.Type = function (type, typeOption) {
//    if (!typeOption) {
//        return { type: type };
//    }
//    else {
//        return 
//    }
//};
///**
// * Force Fireball to serialize a private field.
// * @property {object} FIRE.Serializable
// */
//FIRE.Serializable = { serializable: true };

/**
 * The NonSerialized attribute marks a variable to not be serialized,
 * so you can keep a variable public and Fireball will not attempt to serialize it or show it in the editor.
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

///**
// * @deprecated - No need to define FIRE.Float, you should just set default value to any number
// */
//FIRE.__defineGetter__('Float', function () {
//    console.warn('No need to define FIRE.Float, you should just set default value to any number');
//    return {};
//});

/**
 * Makes a property show up as a enum in Inspector.
 * 
 * @method FIRE.Enum
 * @param {object|string} enumTableOrName
 * @returns {object} the enum attribute
 */
FIRE.Enum = function (enumTableOrName) {
    return { type: 'enum', 'enum': enumTableOrName };
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

//FIRE.serializable = function (serializable) {
//    if (serializable === undefined) {
//        serializable = true;
//    }
//    return { serializable: serializable };
//};
//FIRE.range = function (min, max) {
//    return { min: min, max: max };
//};
//FIRE.min = function (value) {
//    return { min: value };
//};
//FIRE.max = function (value) {
//    return { max: value };
//};

