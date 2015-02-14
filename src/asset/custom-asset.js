var CustomAsset = (function () {

    var CustomAsset = Fire.define('Fire.CustomAsset', Fire.Asset);

    return CustomAsset;
})();

Fire.CustomAsset = CustomAsset;

/**
 * Register a Custom Asset to the "Asset" menu.
 * @param {function} constructor - the class you want to register, must inherit from Custom Asset
 * @param {string} menuPath - the menu path name. Eg. "Rendering/Camera"
 * @param {number} [priority] - the order which the menu item are displayed
 */
Fire.addCustomAssetMenu = Fire.addCustomAssetMenu || function (constructor, menuPath, priority) {
    // implement only available in editor
};
