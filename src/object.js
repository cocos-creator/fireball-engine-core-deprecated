FObject = (function () {
    
    // constructor

    function FObject () {
        this._objFlags = 0;
    }
    Fire.registerClass("Fire.FObject", FObject);

    // static

    /**
     * Checks whether the object is not destroyed
     * @method FObject.isValid
     * @return {boolean} whether it is not destroyed
     * @see Fire.FObject#destroy
     * @static
     */
    Object.defineProperty(FObject, 'isValid', {
        value: function (object) {
            return !!object && !(object._objFlags & Destroyed);
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

    FObject.prototype._destroyImmediate = function () {
        if (this._objFlags & Destroyed) {
            Fire.error('object already destroyed');
            return;
        }
        // engine internal callback
        if (this._onPreDestroy) {
            this._onPreDestroy();
        }
        // TODO do destroy，允许重载destroy
            // 所有可枚举到的属性，都会被清空
        // mark destroyed
        this._objFlags |= Destroyed;
    };

    /**
     * Checks whether the object is not destroyed
     * @return {boolean} whether it is not destroyed
     * @see Fire.FObject#destroy
     */
    Object.defineProperty(FObject.prototype, 'isValid', {
        get: function () {
            return !(this._objFlags & Destroyed);
        }
    });

    return FObject;
})();

Fire.FObject = FObject;
