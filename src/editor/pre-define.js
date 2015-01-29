
// Register Custom Asset Menu

Fire._customAssetMenuItems = [];

/**
 * Register a Custom Asset to the "Asset" menu.
 *
 * @method Fire.addCustomAssetMenu
 * @param {function} constructor - the class you want to register, must inherit from Custom Asset
 * @param {string} menuPath - the menu path name. Eg. "Rendering/Camera"
 * @param {number} [priority] - the order which the menu item are displayed
 */
Fire.addCustomAssetMenu = function (constructor, menuPath, priority) {
    Fire._customAssetMenuItems.push({
        customAsset: constructor,
        menuPath: menuPath,
        priority: priority
    });
    if (Fire.sendToPages) {
        Fire.sendToPages('asset:refresh-context-menu');
    }
};
