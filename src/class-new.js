
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
                var def = val.default;
                var getter = val.get;
                var setter = val.set;
                if (def) {
                    cls.prop.apply(cls, [propName, def].concat(attrs));
                }
                else {
                    // @ifdef EDITOR
                    if (!getter && !setter) {
                        Fire.error('属性至少要定义 default, get, set 的其中一个！');
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
                Fire.warn('未识别的参数 %s.%s, 你要的是 "%s" ？', name, funcName, correct);
            }
            else {
                Fire.error('未识别的属性 %s.%s', name, funcName);
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
            Fire.error('请将 %s.%s 的 type 定义成对应类型的构造函数', className, propName);
            // @endif
        }
        else if (typeof type === 'object') {
            if (type.hasOwnProperty('__enums__')) {
                result.push(Fire.Enum(type));
            }
            // @ifdef EDITOR
            else {
                Fire.error('请将 %s.%s 的 type 定义成对象的构造函数', className, propName);
            }
            // @endif
        }
        else if (typeof type === 'function') {
            result.push(Fire.ObjectType(type));
        }
        // @ifdef EDITOR
        else {
            Fire.error('未能识别 %s.%s 的 type 定义：%s', className, propName, type);
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

//
//// drafts
//
//var Entity = Fire.Class({
//
//    is: 'Fire.Entity',
//
//    extends: EventTarget,
//
//    constructor: function () {
//        var name = arguments[0];
//
//        this._name = typeof name !== 'undefined' ? name : 'New Entity';
//        this._objFlags |= Entity._defaultFlags;
//
//        if (Fire._isCloning) {
//            // create by deserializer or instantiating
//
//            this._activeInHierarchy = false;
//        }
//        else {
//            // create dynamically
//
//            this._activeInHierarchy = true;
//            // init transform
//            var transform = new Transform();
//            transform.entity = this;
//            this._components = [transform];
//            this.transform = transform;
//            // add to scene
//            if (Engine._scene) {
//                Engine._scene.appendRoot(this);
//            }
//            // invoke callbacks
//            Engine._renderContext.onRootEntityCreated(this);
//
//            // activate componet
//            transform._onEntityActivated(true);     // 因为是刚刚创建，所以 activeInHierarchy 肯定为 true
//
//// @ifdef EDITOR
//            if (editorCallback.onEntityCreated) {
//                editorCallback.onEntityCreated(this);
//            }
//            if ( editorCallback.onComponentAdded ) {
//                editorCallback.onComponentAdded(this, transform);
//            }
//// @endif
//        }
//    },
//
//    properties: {
//
//        _active: {
//            default: true,
//            attributes: [Fire.HideInInspector]
//        },
//        _parent: {
//            default: null,
//            attributes: [Fire.HideInInspector]
//        },
//        _children: {
//            default: [],
//            attributes: [Fire.HideInInspector]
//        },
//        _components: {
//            default: null,
//            attributes: [Fire.HideInInspector]
//        },
//        transform: {
//            default: null,
//            attributes: [Fire.HideInInspector]
//        },
//
//        name: {
//            get: function () {
//                return this._name;
//            },
//            set: function (value) {
//                this._name = value;
//            // @ifdef EDITOR
//                if (editorCallback.onEntityRenamed) {
//                    editorCallback.onEntityRenamed(this);
//                }
//            // @endif
//            }
//        },
//        active: {
//            get: function () {
//                return this._active;
//            },
//            set: function (value) {
//                // jshint eqeqeq: false
//                if (this._active != value) {
//                    // jshint eqeqeq: true
//                    this._active = value;
//                    var canActiveInHierarchy = (!this._parent || this._parent._activeInHierarchy);
//                    if (canActiveInHierarchy) {
//                        this._onActivatedInHierarchy(value);
//                    }
//                }
//            }
//        },
//
//        /**
//         * Get the amount of children
//         * @property {number} Fire.Entity#childCount
//         */
//        childCount: {
//            get: function () {
//                return this._children.length;
//            }
//        },
//
//        _onPreDestroy: function () {
//            var parent = this._parent;
//            this._objFlags |= Destroying;
//            var isTopMost = !(parent && (parent._objFlags & Destroying));
//            if (isTopMost) {
//                Engine._renderContext.onEntityRemoved(this);
//    // @ifdef EDITOR
//                if (editorCallback.onEntityRemoved) {
//                    editorCallback.onEntityRemoved(this/*, isTopMost*/);
//                }
//    // @endif
//            }
//            // destroy components
//            for (var c = 0; c < this._components.length; ++c) {
//                var component = this._components[c];
//                // destroy immediate so its _onPreDestroy can be called before
//                component._destroyImmediate();
//            }
//            // remove self
//            if (parent) {
//                if (isTopMost) {
//                    parent._children.splice(parent._children.indexOf(this), 1);
//                }
//            }
//            else {
//                Engine._scene.removeRoot(this);
//            }
//            // destroy children
//            var children = this._children;
//            for (var i = 0, len = children.length; i < len; ++i) {
//                // destroy immediate so its _onPreDestroy can be called before
//                children[i]._destroyImmediate();
//            }
//        }
//    }
//});
//
//var test = Fire.extend(Fire.Component, function () {
//    this.test = new Foobar();
//    this.test.foo = 20;
//});
//
//test.prop('speed', 10, Fire.NonSerialized);
//test.prop('myEntity', null, Fire.ObjectType(Fire.Entity), Fire.HideInInspector);
//test.prop('sprites', [], Fire.ObjectType(Fire.SpriteRenderer));
//test.prop('position', new Fire.Vec2(2, 2), Fire.Watch('customSize_', function (obj, propEL) {
//    propEL.disabled = !obj.customSize_;
//}));
//test.prop('multiText', "Hello World", Fire.MultiText);
//test.prop('slide', 20, Fire.Range(0, 30));
//
//var test = Fire.Class({
//
//    extends: Fire.Component,
//
//    constructor: function () {
//        this.test = new Foobar();
//        this.test.foo = 20;
//    },
//
//    speed: {
//        default: 10,
//        attributes: Fire.NonSerialized
//    },
//    myEntity: {
//        default: null,
//        attributes: [Fire.ObjectType(Fire.Entity), Fire.HideInInspector]
//    },
//    sprites: {
//        default: [],
//        attributes: Fire.ObjectType(Fire.SpriteRenderer)
//    },
//    position: {
//        default: new Fire.Vec2(2, 2),
//        attributes: [
//            Fire.Watch('customSize_', function (obj, propEL) {
//                propEL.disabled = !obj.customSize_;
//            })
//        ]
//    },
//    multiText: {
//        default: "Hello World",
//        attributes: Fire.MultiText
//    },
//    slide: {
//        default: 20,
//        attributes: Fire.Range(0, 30)
//    }
//});
//
//var test = Fire.Class({
//
//    extends: Fire.Component,
//
//    constructor: function () {
//        this.test = new Foobar();
//        this.test.foo = 20;
//    },
//
//    speed: {
//        default: 10,
//        serializable: false
//    },
//    myEntity: {
//        default: null,
//        type: Fire.Entity,
//        hideInInspector: true
//    },
//    sprites: {
//        default: [],
//        type: Fire.SpriteRenderer
//    },
//    position: {
//        default: new Fire.Vec2(2, 2),
//        watch: {
//            names: 'customSize_',
//            callback: function (obj, propEL) {
//                propEL.disabled = !obj.customSize_;
//            }
//        }
//    },
//    multiText: {
//        default: "Hello World",
//        textMode: 'multi'
//    },
//    slide: {
//        default: 20,
//        range: [0, 30]
//    }
//});