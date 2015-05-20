var CustomAsset = (function () {

    var CustomAsset = Fire.Class({

        name: "Fire.CustomAsset",

        extends: Fire.Atlas

    });

    return CustomAsset;
})();

Fire.CustomAsset = CustomAsset;

Fire.addCustomAssetMenu = Fire.addCustomAssetMenu || function (constructor, menuPath, priority) {
    // implement only available in editor
};
