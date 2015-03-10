var Asset = (function () {

    var Asset = Fire.extend('Fire.Asset', Fire.HashObject, function () {
        // define uuid, uuid can not destory
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destroy,
                                // so the _uuid can not display in console.
        });

        this.dirty = false;
    });

    /* TODO: These callbacks available for ?
    Asset.prototype.onBeforeSerialize = function () {};
    Asset.prototype.onAfterDeserialize = function () {};
     */

    Asset.prototype._setRawExtname = function (extname) {
        if (this.hasOwnProperty('_rawext')) {
            if (extname.charAt(0) === '.') {
                extname = extname.substring(1);
            }
            this._rawext = extname;
        }
        else {
            Fire.error('Have not defined any RawTypes yet, no need to set raw file\'s extname.');
        }
    };

    return Asset;
})();

Fire.Asset = Asset;
