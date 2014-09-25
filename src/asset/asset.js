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

    /* These callbacks available for all sub-classes of FObject
    Asset.prototype.onBeforeSerialize = function () {};
    Asset.prototype.onAfterDeserialize = function () {};
     */

    return Asset;
})();
