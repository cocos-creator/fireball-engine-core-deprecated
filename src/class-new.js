/**
 * !#en Defines a FireClass using the given specification, please see [Class](/en/scripting/class/) for details.
 * !#zh 定义一个 FireClass，传入参数必须是一个包含类型参数的字面量对象，具体用法请查阅[类型定义](/zh/scripting/class/)。
 *
 * @method Class
 * @param {object} options
 * @return {function} - the created class
 *
 * @example
    // define base class
    var Node = Fire.Class();

    // define sub class
    var Sprite = Fire.Class({
        name: 'Sprite',
        extends: Node,
        constructor: function () {
            this.url = "";
            this.id = 0;
        },

        properties {
            width: {
                default: 128,
                type: 'Integer',
                tooltip: 'The width of sprite'
            },
            height: 128,
            size: {
                get: function () {
                    return Fire.v2(this.width, this.height);
                }
            }
        },

        load: function () {
            // load this.url
        };
    });

    // instantiate

    var obj = new Sprite();
    obj.url = 'sprite.png';
    obj.load();

    // define static member

    Sprite.count = 0;
    Sprite.getBounds = function (spriteList) {
        // ...
    };
 */

// 不能使用于get方法的属性
var _propertyNotForGet = [
    'default',
    'serializable',
    'editorOnly',
    'rawType'
];

Fire.Class = function (options) {
    if (arguments.length === 0) {
        return Fire.define();
    }
    if ( !options ) {
        Fire.error('[Fire.Class] Option must be non-nil');
        return Fire.define();
    }

    var name = options.name;
    var base = options.extends || FObject;
    var ctor = (options.hasOwnProperty('constructor') && options.constructor) || undefined;

    // create constructor
    var cls;
    //if (base) {
        if (name) {
            cls = Fire.extend(name, base, ctor);
        }
        else {
            cls = Fire.extend(base, ctor);
            name = Fire.JS.getClassName(cls);
        }
    //}
    //else {
    //    if (name) {
    //        cls = Fire.define(name, ctor);
    //    }
    //    else {
    //        cls = Fire.define(ctor);
    //        name = Fire.JS.getClassName(cls);
    //    }
    //}

    // define properties
    var properties = options.properties;
    if (properties) {
        // 预处理属性
        preParseProperties(properties);

        for (var propName in properties) {
            var val = properties[propName];
            var isObj = val && typeof val === 'object' && !Array.isArray(val);
            var isLiteral = isObj && val.constructor === ({}).constructor;
            if ( !isLiteral ) {
                val = {
                    default: val
                };
            }
            //var isValueType = typeof val.prototype.clone === 'function';
            //if (isValueType) {
            //    cls.prop(propName, val);
            //    continue;
            //}
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
        }
    }

    // define statics
    var statics = options.statics;
    if (statics) {
        // @ifdef EDITOR
        var INVALID_STATICS = ['name', '__ctors__', '__props__', 'arguments', 'call', 'apply', 'caller', 'get', 'getset',
                               'length', 'prop', 'prototype', 'set'];
        // @endif
        for (var staticPropName in statics) {
            // @ifdef EDITOR
            if (INVALID_STATICS.indexOf(staticPropName) !== -1) {
                Fire.error('Cannot define %s.%s because static member name can not be "%s".', name, staticPropName, staticPropName);
                continue;
            }
            // @endif
            cls[staticPropName] = statics[staticPropName];
        }
    }

    // define functions
    var BUILTIN_ENTRIES = ['name', 'extends', 'constructor', 'properties', 'statics'];
    for (var funcName in options) {
        if (BUILTIN_ENTRIES.indexOf(funcName) !== -1) {
            continue;
        }
        var func = options[funcName];
        var type = typeof func;
        if (type === 'function' || func === null) {
            cls.prototype[funcName] = func;
        }
        // @ifdef EDITOR
        else {
            var TypoCheckList = {
                extend: 'extends',
                property: 'properties',
                static: 'statics'
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

// 预处理属性值，例如：notify等
function preParseProperties (properties) {
    for (var propName in properties) {
        var val = properties[propName];
        if (!val) {
            continue;
        }

        var notify = val.notify;
        if (notify) {
            if (val.get || val.set) {
                // @ifdef DEV
                Fire.warn('"notify" can\'t work with "get/set" !');
                // @endif
                continue;
            }
            if (val.hasOwnProperty('default')) {
                // 添加新的内部属性，将原来的属性修改为 getter/setter 形式
                // 以 _ 开头将自动设置property 为 Fire.HideInInspector
                var newKey = "_val$" + propName;

                (function (notify, newKey) {
                    val.get = function () {
                        return this[newKey];
                    };
                    val.set = function (value) {
                        var oldValue = this[newKey];
                        this[newKey] = value;
                        notify.call(this, oldValue);
                    };
                })(notify, newKey);

                var newValue = {};
                properties[newKey] = newValue;
                // 将不能用于get方法中的属性移动到newValue中
                for (var i in _propertyNotForGet) {
                    var prop = _propertyNotForGet[i];

                    if (val.hasOwnProperty(prop)) {
                        newValue[prop] = val[prop];
                        delete val[prop];
                    }
                }
            }
            // @ifdef DEV
            else {
                Fire.warn('"notify" must work with "default" !');
            }
            // @endif
        }
    }
}

var tmpAttrs = [];
function parseAttributes (attrs, className, propName) {
    // @ifdef EDITOR
    var ERR_Type = 'The %s of %s must be type %s';
    // @endif

    tmpAttrs.length = 0;
    var result = tmpAttrs;

    var type = attrs.type;
    if (type) {
        if (Array.isArray(type)) {
            if (type.length > 0) {
                type = type[0];
            }
            else {
                Fire.error('Invalid type of %s.%s', className, propName);
                return;
            }
        }
        if (type === Fire.Integer) {
            result.push(Fire.Integer_Obsoleted);
        }
        else if (type === Fire.Float || type === Number) {
            result.push(Fire.Float_Obsoleted);
        }
        else if (type === Fire.Boolean || type === Boolean) {
            result.push(Fire.Boolean_Obsoleted);
        }
        else if (type === Fire.String || type === String) {
            result.push(Fire.String_Obsoleted);
        }
        else if (type === 'Object' || type === Object) {
            // @ifdef EDITOR
            Fire.error('Please define "type" parameter of %s.%s as the actual constructor.', className, propName);
            // @endif
        }
        else if (type === Fire._ScriptUuid) {
            var attr = Fire.ObjectType(Fire.ScriptAsset);
            attr.type = 'script-uuid';
            result.push(attr);
        }
        else {
            if (typeof type === 'object') {
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
    }

    function parseSimpleAttr (attrName, expectType, attrCreater) {
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

    parseSimpleAttr('rawType', 'string', Fire.RawType);
    parseSimpleAttr('editorOnly', 'boolean', Fire.EditorOnly);
    parseSimpleAttr('displayName', 'string', Fire.DisplayName);
    parseSimpleAttr('multiline', 'boolean', Fire.MultiText);
    parseSimpleAttr('readonly', 'boolean', Fire.ReadOnly);
    parseSimpleAttr('tooltip', 'string', Fire.Tooltip);

    if (attrs.serializable === false) {
        result.push(Fire.NonSerialized);
    }

    var visible = attrs.visible;
    if (typeof visible !== 'undefined') {
        if ( !attrs.visible ) {
            result.push(Fire.HideInInspector);
        }
    }
    else {
        var startsWithUS = (propName.charCodeAt(0) === 95);
        if (startsWithUS) {
            result.push(Fire.HideInInspector);
        }
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
