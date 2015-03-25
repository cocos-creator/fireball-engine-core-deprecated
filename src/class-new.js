
Fire.Class = function (options) {
    var name = options.name;
    var base = options.extends;
    var ctor = options.hasOwnProperty('constructor') && options.constructor;

    // create constructor
    var cls;
    if (base) {
        if (name) {
            cls = Fire.extend(name, base, ctor);
        }
        else {
            cls = Fire.extend(base, ctor);
            name = Fire.JS.getClassName(cls);
        }
    }
    else {
        if (name) {
            cls = Fire.define(name, ctor);
        }
        else {
            cls = Fire.define(ctor);
            name = Fire.JS.getClassName(cls);
        }
    }

    // define properties
    var properties = options.properties;
    if (properties) {
        for (var propName in properties) {
            var val = properties[propName];
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                var attrs = parseAttributes(val, name, propName);
                if (val.hasOwnProperty('default')) {
                    cls.prop.apply(cls, [propName, val.default].concat(attrs));
                }
                else {
                    var getter = val.get;
                    var setter = val.set;
                    // @ifdef EDITOR
                    if (!getter && !setter) {
                        Fire.error('Property %s.%s must define at least one of "default", "get" or "set".', name, propName);
                    }
                    // @endif
                    if (getter) {
                        cls.get.apply(cls, [propName, getter].concat(attrs));
                    }
                    if (setter) {
                        cls.set(propName, setter);
                    }
                }
                //Fire.error('属性 %s.%s 不能定义为 null', name, propName);
            }
            else {
                cls.prop(propName, val);
            }
            // @ifdef EDITOR
            //else {
            //    Fire.error('属性 %s.%s 不能定义为 %s', name, propName, type);
            //}
            // @endif
        }
    }

    // define functions
    for (var funcName in options) {
        if (funcName === 'name' || funcName === 'extends' || funcName === 'constructor' || funcName === 'properties') {
            continue;
        }
        var func = options[funcName];
        var type = typeof func;
        if (type === 'function') {
            cls.prototype[funcName] = func;
        }
        // @ifdef EDITOR
        else {
            var TypoCheckList = {
                extend: 'extends',
                property: 'properties'
            };
            var correct = TypoCheckList[funcName];
            if (correct) {
                Fire.warn('Unknown parameter of %s.%s, maybe you want is "%s".', name, funcName, correct);
            }
            else {
                Fire.error('Unknown parameter of %s.%s', name, funcName);
            }
        }
        // @endif
    }

    return cls;
};

var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    // @ifdef EDITOR
    var ERR_Type = 'The %s of %s must be type %s';
    // @endif

    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        if (type === 'Integer') {
            result.push(Fire.Integer);
        }
        else if (type === 'Float' || type === Number) {
            result.push(Fire.Float);
        }
        else if (type === 'Boolean' || type === Boolean) {
            result.push(Fire.Boolean);
        }
        else if (type === 'String' || type === String) {
            result.push(Fire.String);
        }
        else if (type === 'Object' || type === Object) {
            // @ifdef EDITOR
            Fire.error('Please define "type" parameter of %s.%s as the actual constructor.', className, propName);
            // @endif
        }
        else if (typeof type === 'object') {
            if (type.hasOwnProperty('__enums__')) {
                result.push(Fire.Enum(type));
            }
            // @ifdef EDITOR
            else {
                Fire.error('Please define "type" parameter of %s.%s as the constructor of %s.', className, propName, type);
            }
            // @endif
        }
        else if (typeof type === 'function') {
            result.push(Fire.ObjectType(type));
        }
        // @ifdef EDITOR
        else {
            Fire.error('Unknown "type" parameter of %s.%s：%s', className, propName, type);
        }
        // @endif
    }

    function applyAttr (attrName, expectType, attrCreater) {
        var val = attrs[attrName];
        if (val) {
            if (typeof val === expectType) {
                result.push(typeof attrCreater === 'function' ? attrCreater(val) : attrCreater);
            }
            // @ifdef EDITOR
            else {
                Fire.error('The %s of %s.%s must be type %s', attrName, className, propName, expectType);
            }
            // @endif
        }
    }

    applyAttr('rawType', 'string', Fire.RawType);
    applyAttr('hideInInspector', 'boolean', Fire.HideInInspector);
    applyAttr('editorOnly', 'boolean', Fire.EditorOnly);
    applyAttr('displayName', 'string', Fire.DisplayName);
    applyAttr('multiline', 'boolean', Fire.MultiText);
    applyAttr('readOnly', 'boolean', Fire.ReadOnly);
    applyAttr('tooltip', 'string', Fire.Tooltip);

    if (attrs.serializable === false) {
        result.push(Fire.NonSerialized);
    }
    //if (attrs.custom) {
    //    result.push(Fire.Custom(attrs.custom));
    //}

    var range = attrs.range;
    if (range) {
        if (Array.isArray(range)) {
            if (range.length >= 2) {
                result.push(Fire.Range(range[0], range[1]));
            }
            // @ifdef EDITOR
            else {
                Fire.error('The length of range array must be 2');
            }
            // @endif
        }
        // @ifdef EDITOR
        else {
            Fire.error(ERR_Type, '"range"', className + '.' + propName, 'array');
        }
        // @endif
    }

    var nullable = attrs.nullable;
    if (nullable) {
        if (typeof nullable === 'object') {
            var boolPropName = nullable.propName;
            if (typeof boolPropName === 'string') {
                var def = nullable.default;
                if (typeof def === 'boolean') {
                    result.push(Fire.Nullable(boolPropName, def));
                }
                // @ifdef EDITOR
                else {
                    Fire.error(ERR_Type, '"default"', 'nullable object', 'boolean');
                }
                // @endif
            }
            // @ifdef EDITOR
            else {
                Fire.error(ERR_Type, '"propName"', 'nullable object', 'string');
            }
            // @endif
        }
        // @ifdef EDITOR
        else {
            Fire.error(ERR_Type, '"nullable"', className + '.' + propName, 'object');
        }
        // @endif
    }

    var watch = attrs.watch;
    if (watch) {
        if (typeof watch === 'object') {
            for (var watchKey in watch) {
                var watchCallback = watch[watchKey];
                if (typeof watchCallback === 'function') {
                    result.push(Fire.Watch(watchKey.split(' '), watchCallback));
                }
                // @ifdef EDITOR
                else {
                    Fire.error(ERR_Type, 'value', 'watch object', 'function');
                }
                // @endif
            }
        }
        // @ifdef EDITOR
        else {
            Fire.error(ERR_Type, 'watch', className + '.' + propName, 'object');
        }
        // @endif
    }

    return result;
}
