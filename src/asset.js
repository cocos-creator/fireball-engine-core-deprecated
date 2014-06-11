FIRE.Asset = (function () {
    var _super = FIRE.FObject;

    // constructor
    function Asset () {
        _super.call(this);
    }
    FIRE.extend(Asset, _super);
    Asset.prototype.__classname__ = "FIRE.Asset";
    Asset.prototype.getClassName = function () { return this.__classname__; };

    return Asset;
})();


