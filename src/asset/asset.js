Fire.Asset = (function () {

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

    return Asset;
})();
