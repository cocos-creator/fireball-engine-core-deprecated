FIRE.FObject = (function () {
    
    // constructor

    function FObject () {
    }
    FObject.prototype.__classname__ = "FIRE.FObject";

    // static

    /**
     * Checks whether the object is not destroyed
     * @method FIRE.isValid
     * @return {Boolean} whether it is not destroyed
     * @see FIRE.FObject#destroy
     * @static
     */
    FObject.isValid = function (object) {
        return !!object && !object._destroyed;
    };

    var objectsToDestroy = [];

    FObject._deferredDestroy = function () {
        // if we called b.destory() in a.onDestroy(), objectsToDestroy will be resized, 
        // but we only destroy the objects which called destory in this frame.
        var deleteCount = objectsToDestroy.length;
        for (var i = 0; i < deleteCount; ++i) {
            var obj = objectsToDestroy[i];
            //delete obj._toDestroy;
            obj._destroyImmediate();
        }
        if (deleteCount === objectsToDestroy.length) {
            objectsToDestroy.length = 0;
        }
        else {
            objectsToDestroy.splice(0, deleteCount);
        }
    };

    // instance

    /**
     * Destroy this FObject, and release all its own references to other resources.
     * After destory, this FObject is not usable any more.
     * You can use FIRE.isValid(obj) (or obj.isValid if obj is non-nil) to check whether the object is destroyed before accessing it.
     * @method FIRE.FObject#destroy
     * @see FIRE.isValid
     */
    FObject.prototype.destroy = function () {
        if (this._destroyed || this._toDestroy) {   // TODO: use flags  
            console.error('object already destroyed');
            return;
        }
        objectsToDestroy.push(this);
        this._toDestroy = true;
    };

    FObject.prototype._destroyImmediate = function () {
        if (this._destroyed) {
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
        this._destroyed = true;
    };

    /**
     * Checks whether the object is not destroyed
     * @return {Boolean} whether it is not destroyed
     * @see FIRE.FObject#destroy
     */
    FObject.prototype.__defineGetter__('isValid', function () {
        return !this._destroyed;
    });

    return FObject;
})();


