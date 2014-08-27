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
        for (var name in attributes) {
            attrs[name] = attributes[name];
        }
    }
    return attrs;
};

FIRE.Type = function (type) {
    return { type: type };
};

/**
 * @property FIRE.Serializable
 * Force Fireball to serialize a private field.
 */
FIRE.Serializable = { serializable: true };

/**
 * @property FIRE.NonSerialized
 * The NonSerialized attribute marks a variable to not be serialized,
 * so you can keep a variable public and Fireball will not attempt to serialize it or show it in the editor.
 */
FIRE.NonSerialized = { serializable: false };

