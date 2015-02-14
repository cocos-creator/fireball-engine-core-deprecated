FObject = (function () {

    // constructor

    function FObject () {
        this._name = '';
        this._objFlags = 0;
    }

    // TODO: 统一FireClass和FObject
    Fire._fastDefine('Fire.FObject', FObject, ['_name', '_objFlags']);

    // static

    /**
     * Checks whether the object is not destroyed
     * @method Fire.isValid
     * @return {boolean} whether it is not destroyed
     * @see Fire.FObject#isValid
     */
    Fire.isValid = function (object) {
        return !!object && !(object._objFlags & Destroyed);
    };
    Object.defineProperty(FObject, 'isValid', {
        value: function (object) {
            Fire.warn('FObject.isValid is deprecated, use Fire.isValid instead please');
            return Fire.isValid(object);
        },
        enumerable: false
    });

    // internal static

    var objectsToDestroy = [];

    Object.defineProperty(FObject, '_deferredDestroy', {
        value: function () {
            // if we called b.destory() in a.onDestroy(), objectsToDestroy will be resized,
            // but we only destroy the objects which called destory in this frame.
            var deleteCount = objectsToDestroy.length;
            for (var i = 0; i < deleteCount; ++i) {
                var obj = objectsToDestroy[i];
                if (!(obj._objFlags & Destroyed)) {
                    obj._destroyImmediate();
                }
            }
            if (deleteCount === objectsToDestroy.length) {
                objectsToDestroy.length = 0;
            }
            else {
                objectsToDestroy.splice(0, deleteCount);
            }
        },
        enumerable: false
    });

    // instance

    /**
     * @property {boolean} Fire.FObject#name
     */
    Object.defineProperty(FObject.prototype, 'name', {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: false
    });

    /**
     * Checks whether the object is not destroyed
     * @property {boolean} Fire.FObject#isValid
     * @see Fire.FObject#destroy
     */
    Object.defineProperty(FObject.prototype, 'isValid', {
        get: function () {
            return !(this._objFlags & Destroyed);
        }
    });

    /**
     * Destroy this FObject, and release all its own references to other resources.
     * After destory, this FObject is not usable any more.
     * You can use Fire.isValid(obj) (or obj.isValid if obj is non-nil) to check whether the object is destroyed before accessing it.
     * @method Fire.FObject#destroy
     * @return {boolean} whether it is the first time the destroy being called
     * @see Fire.isValid
     */
    FObject.prototype.destroy = function () {
        if (this._objFlags & Destroyed) {
            Fire.error('object already destroyed');
            return;
        }
        if (this._objFlags & ToDestroy) {
            return false;
        }
        this._objFlags |= ToDestroy;
        objectsToDestroy.push(this);
        return true;
    };

    /**
     * Clear all references in the instance.
     * NOTE: this method will not clear the getter or setter functions which defined in the INSTANCE of FObject.
     *       You can override the _destruct method if you need.
     */
    FObject.prototype._destruct = function () {
        // 允许重载destroy
        // 所有可枚举到的属性，都会被清空
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                var type = typeof this[key];
                switch (type) {
                    case 'string':
                        this[key] = '';
                        break;
                    case 'object':
                        this[key] = null;
                        break;
                    case 'function':
                        this[key] = null;
                        break;
                    default:
                        break;
                }
            }
        }
    };

    FObject.prototype._destroyImmediate = function () {
        if (this._objFlags & Destroyed) {
            Fire.error('object already destroyed');
            return;
        }
        // engine internal callback
        if (this._onPreDestroy) {
            this._onPreDestroy();
        }
        // do destroy
        this._destruct();
        // mark destroyed
        this._objFlags |= Destroyed;
    };

    return FObject;
})();

Fire.FObject = FObject;
