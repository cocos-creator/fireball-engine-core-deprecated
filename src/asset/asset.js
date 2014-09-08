FIRE.Asset = (function () {

    var Asset = FIRE.define('FIRE.Asset', FIRE.FObject, function () {
        Asset.$super.call(this);

        // define uuid, uuid can not destory
        Object.defineProperty(this, '_uuid', {
            value: '',
            enumerable: false   // avoid uuid being assigned to empty string during destory
        });
    });

    /*
    Asset.prototype.onBeforeSerialize = function () {};
    Asset.prototype.onAfterDeserialize = function () {};
     */

    return Asset;
})();


