// global definitions

Fire.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
Fire.isNodeWebkit = !!(Fire.isNode && 'node-webkit' in process.versions);   // node-webkit
Fire.isAtomShell = !!(Fire.isNode && 'atom-shell' in process.versions);     // atom-shell
Fire.isApp = Fire.isNodeWebkit || Fire.isAtomShell;                         // native client
Fire.isPureWeb = !Fire.isNode && !Fire.isApp;                               // common web browser
Fire.isEditor = Fire.isApp;     // by far there is no standalone client version, so app == editor

if (Fire.isAtomShell) {
    Fire.isWeb = typeof process !== 'undefined' && process.type === 'renderer';
}
else {
    Fire.isWeb = (typeof __dirname === 'undefined' || __dirname === null); // common web browser, or window's render context in node-webkit or atom-shell
}
Fire.isEditorCore = Fire.isApp && !Fire.isWeb;

if (Fire.isNode) {
    Fire.isDarwin = process.platform === 'darwin';
    Fire.isWin32 = process.platform === 'win32';
}
else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var platform = window.navigator.platform;
    Fire.isDarwin = platform.substring(0, 3) === 'Mac';
    Fire.isWin32 = platform.substring(0, 3) === 'Win';
}

if (Fire.isPureWeb) {
    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();
    Fire.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
    Fire.isIOS = !!ua.match(/(iPad|iPhone|iPod)/i);
    Fire.isAndroid = !!(ua.match(/android/i) || nav.platform.match(/android/i));
}
else {
    Fire.isAndroid = Fire.isIOS = Fire.isMobile = false;
}

/**
 * Check if running in retina device, 这个属性会随着浏览器窗口所在的显示器变化而变化
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Fire, 'isRetina', {
    get: function () {
        return Fire.isWeb && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
});

/**
 * Retina support is enabled by default for Apple device but disabled for other devices,
 * Fire.isRetina 只表示浏览器的当前状态，而游戏的 Canvas 只有在 Fire.isRetinaEnabled 为 true 时才会使用高清分辨率。
 * 由于安卓太卡，所以默认不启用 retina。
 */
Fire.isRetinaEnabled = (Fire.isIOS || Fire.isDarwin) && !Fire.isEditor && Fire.isRetina;


// definitions for FObject._objFlags

var Destroyed = 1 << 0;
var ToDestroy = 1 << 1;
var DontSave = 1 << 2;
var EditorOnly  = 1 << 3; // dont save in build
var Dirty = 1 << 4; // used in editor
var DontDestroy = 1 << 5; // dont destroy automatically when loading a new scene

/**
 *
 * Mark object with different flags.
 * @type object
 * @property _ObjectFlags
 */
var ObjectFlags = {
    // public flags

    DontSave: DontSave,
    EditorOnly: EditorOnly,
    Dirty: Dirty,
    DontDestroy: DontDestroy,

    // public flags for engine

    Destroying: 1 << 9,
    /**
     * Hide in game and hierarchy.
     * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
     * @property _ObjectFlags.HideInGame
     * @type number
     */
    HideInGame: 1 << 10,

    // public flags for editor

    /**
     * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
     * @property _ObjectFlags.HideInEditor
     * @type number
     */
    HideInEditor: 1 << 11,

    // flags for Component
    IsOnEnableCalled: 1 << 12,
    IsOnLoadCalled: 1 << 13,
    IsOnStartCalled: 1 << 14,
    IsEditorOnEnabledCalled: 1 << 15

};

/**
 * Hide in game view, hierarchy, and scene view... etc.
 * This flag is readonly, it can only be used as an argument of scene.createEntity() or Entity.createWithFlags()
 * @property _ObjectFlags.Hide
 * @type number
 */
ObjectFlags.Hide = ObjectFlags.HideInGame | ObjectFlags.HideInEditor;

Fire._ObjectFlags = ObjectFlags;

var PersistentMask = ~(ToDestroy | Dirty | ObjectFlags.Destroying | DontDestroy |     // can not clone these flags
                       ObjectFlags.IsOnEnableCalled |
                       ObjectFlags.IsEditorOnEnabledCalled |
                       ObjectFlags.IsOnLoadCalled |
                       ObjectFlags.IsOnStartCalled);
