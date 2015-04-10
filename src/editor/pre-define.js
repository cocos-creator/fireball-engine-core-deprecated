
// registered custom asset menu items
Fire._customAssetMenuItems = [];

/**
 * Register a Custom Asset to the "Asset" menu.
 *
 * @method addCustomAssetMenu
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
    if (Editor.sendToWindows) {
        Editor.sendToWindows('asset:refresh-context-menu');
    }
};
