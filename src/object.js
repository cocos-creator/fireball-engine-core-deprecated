FObject = (function () {
    
    // constructor

    function FObject () {
        Object.defineProperty(this, '_objFlags', {
            value: 0,
            writable: true,
            enumerable: false
        });
    }
    FIRE.registerClass("FIRE.FObject", FObject);

    //// enum

    //Object.defineProperty(FObject, 'Flags', {
    //    value: {
    //        Destroyed: Destroyed,
    //        _toDestroy: ToDestroy,
    //    },
    //    enumerable: false
    //});

    // static

    /**
     * Checks whether the object is not destroyed
     * @method FObject.isValid
     * @return {boolean} whether it is not destroyed
     * @see FIRE.FObject#destroy
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
     * You can use FIRE.isValid(obj) (or obj.isValid if obj is non-nil) to check whether the object is destroyed before accessing it.
     * @method FIRE.FObject#destroy
     * @return {boolean} whether it is the first time the destroy being called
     * @see FIRE.isValid
     */
    FObject.prototype.destroy = function () {
        if (this._objFlags & Destroyed) {
            console.error('object already destroyed');
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
            console.error('object already destroyed');
            return;
        }
        // engine internal callback
        if (this._onPreDestroy) {
            this._onPreDestroy();
        }
        // do destroy
            // TODO
        // mark destroyed
        this._objFlags |= Destroyed;
    };

    /**
     * Checks whether the object is not destroyed
     * @return {boolean} whether it is not destroyed
     * @see FIRE.FObject#destroy
     */
    Object.defineProperty(FObject.prototype, 'isValid', {
        get: function () {
            return !(this._objFlags & Destroyed);
        }
    });

    return FObject;
})();

FIRE.FObject = FObject;
