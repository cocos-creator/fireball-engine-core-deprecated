FIRE.Asset = (function () {

    var Asset = FIRE.define('FIRE.Asset', FIRE.HashObject, function () {
        FIRE.HashObject.call(this);

        // define uuid, uuid can not destory
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destory
        });

    });

    Asset.prop('debugName', '', FIRE.HideInInspector );

    /* TODO: These callbacks available for ?
    Asset.prototype.onBeforeSerialize = function () {};
    Asset.prototype.onAfterDeserialize = function () {};
     */

    return Asset;
})();
