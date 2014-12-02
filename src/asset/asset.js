var Asset = (function () {

    var Asset = Fire.define('Fire.Asset', Fire.HashObject, function () {
        Fire.HashObject.call(this);

        // define uuid, uuid can not destory
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destory
        });

    });

    /* TODO: These callbacks available for ?
    Asset.prototype.onBeforeSerialize = function () {};
    Asset.prototype.onAfterDeserialize = function () {};
     */

    Asset.prototype._setHostExtname = function (extname) {
        if (this.hasOwnProperty('_hostext')) {
            if (extname.charAt(0) === '.') {
                extname = extname.substring(1);
            }
            this._hostext = extname;
        }
        else {
            Fire.error('Have not defined any HostType yet');
        }
    };

    return Asset;
})();

Fire.Asset = Asset;
