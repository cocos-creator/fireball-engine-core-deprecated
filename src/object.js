/**
 * The base class of most of all the objects in Fireball.
 * @class FObject
 * @constructor
 */
FObject = (function () {

    // constructor

    function FObject () {

        /**
         * @property _name
         * @type string
         * @default ""
         * @private
         */
        this._name = '';

        /**
         * @property _objFlags
         * @type number
         * @default 0
         * @private
         */
        this._objFlags = 0;
    }

    Fire._fastDefine('Fire.FObject', FObject, ['_name', '_objFlags']);

    // internal static

    var objectsToDestroy = [];

    Object.defineProperty(FObject, '_deferredDestroy', {
        value: function () {
            var deleteCount = objectsToDestroy.length;
            for (var i = 0; i < deleteCount; ++i) {
                var obj = objectsToDestroy[i];
                if (!(obj._objFlags & Destroyed)) {
                    obj._destroyImmediate();
                }
            }
            // if we called b.destory() in a.onDestroy(), objectsToDestroy will be resized,
            // but we only destroy the objects which called destory in this frame.
            if (deleteCount === objectsToDestroy.length) {
                objectsToDestroy.length = 0;
            }
            else {
                objectsToDestroy.splice(0, deleteCount);
            }

            // @ifdef EDITOR
            deferredDestroyTimer = -1;
            // @endif
        },
        enumerable: false
    });

    // @ifdef EDITOR
    Object.defineProperty(FObject, '_clearDeferredDestroyTimer', {
        value: function () {
            if (deferredDestroyTimer !== -1) {
                clearTimeout(deferredDestroyTimer);
                deferredDestroyTimer = -1;
            }
        },
        enumerable: false
    });
    // @endif

    // member

    var prototype = FObject.prototype;

    /**
     * The name of the object.
     * @property name
     * @type string
     * @default ""
     */
    JS.getset(prototype, 'name',
        function () {
            return this._name;
        },
        function (value) {
            this._name = value;
        }
    );

    /**
     * Indicates whether the object is not yet destroyed
     * @property isValid
     * @type boolean
     * @default true
     * @readOnly
     */
    JS.get(prototype, 'isValid', function () {
        return !(this._objFlags & Destroyed);
    });

    // @ifdef EDITOR
    var deferredDestroyTimer = -1;
    // @endif

    /**
     * Destroy this FObject, and release all its own references to other resources.
     *
     * After destory, this FObject is not usable any more.
     * You can use Fire.isValid(obj) (or obj.isValid if obj is non-nil) to check whether the object is destroyed before
     * accessing it.
     *
     * @method destroy
     * @return {boolean} whether it is the first time the destroy being called
     */
    prototype.destroy = function () {
        if (this._objFlags & Destroyed) {
            Fire.warn('object already destroyed');
            return false;
        }
        if (this._objFlags & ToDestroy) {
            return false;
        }
        this._objFlags |= ToDestroy;
        objectsToDestroy.push(this);

        // @ifdef EDITOR
        if (deferredDestroyTimer === -1 && Fire.Engine && ! Fire.Engine._isUpdating) {
            // auto destroy immediate in edit mode
            deferredDestroyTimer = setTimeout(FObject._deferredDestroy, 1);
        }
        // @endif
        return true;
    };

    /**
     * Clear all references in the instance.
     *
     * NOTE: this method will not clear the getter or setter functions which defined in the INSTANCE of FObject.
     *       You can override the _destruct method if you need.
     * @method _destruct
     * @private
     */
    prototype._destruct = function () {
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

    /**
     * Called before the object being destroyed.
     * @method _onPreDestroy
     * @private
     */
    prototype._onPreDestroy = null;

    prototype._destroyImmediate = function () {
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

    // @ifdef EDITOR
    /**
     * The customized serialization for this object. (Editor Only)
     * @method _serialize
     * @param {boolean} exporting
     * @return {object} the serialized json data object
     * @private
     */
    prototype._serialize = null;
    // @endif

    /**
     * Init this object from the custom serialized data.
     * @method _deserialize
     * @param {object} data - the serialized json data
     * @param {_Deserializer} ctx
     * @param {object} target
     * @private
     */
    prototype._deserialize = null;

    return FObject;
})();

/**
 * @class Fire
 */
/**
 * Checks whether the object is non-nil and not yet destroyed
 * @method isValid
 * @param {FObject}
 * @return {boolean} whether is valid
 */
Fire.isValid = function (object) {
    return !!object && !(object._objFlags & Destroyed);
};

Fire.FObject = FObject;
