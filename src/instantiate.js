/**
 * !#en Clones the object original and returns the clone.
 *
 * See [Clone exists Entity](http://docs.fireball-x.com/en/scripting/create-destroy-entities/#instantiate)
 *
 * !#zh 复制给定的对象
 *
 * 详细用法可参考[复制已有Entity](http://docs.fireball-x.com/zh/scripting/create-destroy-entities/#instantiate)
 *
 * Instantiate 时，对于不可序列化的字段(包含function和dom)，直接设为 null。
 * 对可以被序列化的字段则统一进行拷贝，不考虑引用是否该和现有场景共享，但能保证实例化后的对象间能共享一份引用。
 * 对于 Asset 永远只拷贝引用。对于 Entity / Component 等 Scene Object，如果对方也会被一起 Instantiate，则重定向到新的引用，否则设置为原来的引用。
 *
 * @method instantiate
 * @param {object} original - An existing object that you want to make a copy of.
 * @return {object} the newly instantiated object
 */
Fire.instantiate = function (original) {
    if (typeof original !== 'object' || Array.isArray(original)) {
        Fire.error('The thing you want to instantiate must be an object');
        return null;
    }
    if (!original) {
        Fire.error('The thing you want to instantiate is nil');
        return null;
    }
    if (original instanceof Fire.FObject && !original.isValid) {
        Fire.error('The thing you want to instantiate is destroyed');
        return null;
    }
    var clone;
    // invoke _instantiate method if supplied
    if (original._instantiate) {
        Fire._isCloning = true;
        clone = original._instantiate();
        Fire._isCloning = false;
        return clone;
    }
    else if (original instanceof Fire.Asset) {
        // 不使用通用的方法实例化资源
        Fire.error('The instantiate method for given asset do not implemented');
        return null;
    }
    //
    Fire._isCloning = true;
    clone = Fire._doInstantiate(original);
    Fire._isCloning = false;
    return clone;
};

Fire._doInstantiate = (function () {

    var objsToClearTmpVar = [];   // 用于重设临时变量

    /**
     * Do instantiate object, the object to instantiate must be non-nil.
     * 这是一个实例化的通用方法，可能效率比较低。
     * 之后可以给各种类型重载快速实例化的特殊实现，但应该在单元测试中将结果和这个方法的结果进行对比。
     * 值得注意的是，这个方法不可重入。
     *
     * @param {object} obj - 该方法仅供内部使用，用户需负责保证参数合法。什么参数是合法的请参考 Fire.instantiate().
     * @return {object}
     * @private
     */
    function doInstantiate (obj) {
        if (Array.isArray(obj)) {
            Fire.error('Can not instantiate array');
            return null;
        }
        if (_isDomNode(obj)) {
            Fire.error('Can not instantiate DOM element');
            return null;
        }

        var clone = enumerateObject(obj);

        for (var i = 0, len = objsToClearTmpVar.length; i < len; ++i) {
            objsToClearTmpVar[i]._iN$t = null;
        }
        objsToClearTmpVar.length = 0;

        return clone;
    }

    /**
     * @param {object} obj - The object to instantiate, typeof mustbe 'object' and should not be an array.
     * @return {object} - the instantiated instance
     */
    var enumerateObject = function (obj) {
        var value, type;
        var klass = obj.constructor;
        var clone = new klass();
        obj._iN$t = clone;
        objsToClearTmpVar.push(obj);
        if (Fire._isFireClass(klass)) {
            // only __props__ will be serialized
            var props = klass.__props__;
            if (props) {
                for (var p = 0; p < props.length; p++) {
                    var propName = props[p];
                    var attrs = Fire.attr(klass, propName);
                    // assume all prop in __props__ must have attr

                    if (attrs.serializable !== false) {
                        value = obj[propName];
                        // instantiate field
                        type = typeof value;
                        clone[propName] = (type === 'object') ?
                                            (value ? instantiateObj(value) : value) :
                                            ((type !== 'function') ? value : null);
                    }
                }
            }
        }
        else {
            // primitive javascript object
            for (var key in obj) {
                //Fire.log(key);
                if (obj.hasOwnProperty(key) === false || (key.charCodeAt(0) === 95 && key.charCodeAt(1) === 95)) {  // starts with __
                    continue;
                }
                value = obj[key];
                if (value === clone) {
                    continue;   // value is obj._iN$t
                }
                // instantiate field
                type = typeof value;
                clone[key] = (type === 'object') ?
                                (value ? instantiateObj(value) : value) :
                                ((type !== 'function') ? value : null);
            }
        }
        if (obj instanceof FObject) {
            clone._objFlags &= PersistentMask;
        }
        return clone;
    };

    /**
     * @return {object} - the original non-nil object, typeof must be 'object'
     */
    function instantiateObj (obj) {
        // 目前使用“_iN$t”这个特殊字段来存实例化后的对象，这样做主要是为了防止循环引用
        // 注意，为了避免循环引用，所有新创建的实例，必须在赋值前被设为源对象的_iN$t
        var clone = obj._iN$t;
        if (clone) {
            // has been instantiated
            return clone;
        }

        if (obj instanceof Asset) {
            // 所有资源直接引用，不进行拷贝
            return obj;
        }
        else if (Array.isArray(obj)) {
            var len = obj.length;
            clone = new Array(len);
            obj._iN$t = clone;
            for (var i = 0; i < len; ++i) {
                var value = obj[i];
                // instantiate field
                var type = typeof value;
                clone[i] = (type === 'object') ?
                                (value ? instantiateObj(value) : value) :
                                ((type !== 'function') ? value : null);
            }
            objsToClearTmpVar.push(obj);
            return clone;
        }
        else if (!_isDomNode(obj)) {
            // instantiate common object
            return enumerateObject(obj);
        }
        else {
            // dom
            return null;
        }
    }

    return doInstantiate;

})();

/**
 * @class Fire
 */
/**
 * @property _isCloning
 * @type {boolean}
 * @private
 */
Fire._isCloning = false;
