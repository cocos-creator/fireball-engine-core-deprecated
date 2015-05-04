// global definitions

/**
 * indicates whether executes in node.js application
 * @property isNode
 * @type {boolean}
 */
Fire.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
Fire.isNodeWebkit = !!(Fire.isNode && 'node-webkit' in process.versions);   // node-webkit
Fire.isAtomShell = !!(Fire.isNode && 'atom-shell' in process.versions);     // atom-shell
Fire.isApp = Fire.isNodeWebkit || Fire.isAtomShell;

/**
 * indicates whether executes in common web browser
 * @property isPureWeb
 * @type {boolean}
 */
Fire.isPureWeb = !Fire.isNode && !Fire.isApp;                               // common web browser

/**
 * indicates whether executes in Fireball editor
 * @property isEditor
 * @type {boolean}
 */
Fire.isEditor = Fire.isApp;     // by far there is no standalone client version, so app == editor

/**
 * indicates whether executes in common web browser, or editor's window process(atom-shell's renderer context)
 * @property isWeb
 * @type {boolean}
 */
if (Fire.isAtomShell) {
    Fire.isWeb = typeof process !== 'undefined' && process.type === 'renderer';
}
else {
    Fire.isWeb = (typeof __dirname === 'undefined' || __dirname === null);
}

/**
 * indicates whether executes in editor's core process(atom-shell's browser context)
 * @property isEditorCore
 * @type {boolean}
 */
Fire.isEditorCore = Fire.isApp && !Fire.isWeb;

if (Fire.isNode) {
    /**
     * indicates whether executes in OSX
     * @property isDarwin
     * @type {boolean}
     */
    Fire.isDarwin = process.platform === 'darwin';

    /**
     * indicates whether executes in Windows
     * @property isWin32
     * @type {boolean}
     */
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

    /**
     * indicates whether executes in mobile device
     * @property isMobile
     * @type {boolean}
     */
    Fire.isMobile = ua.indexOf('mobile') !== -1 || ua.indexOf('android') !== -1;
    /**
     * indicates whether executes in iOS
     * @property isIOS
     * @type {boolean}
     */
    Fire.isIOS = !!ua.match(/(iPad|iPhone|iPod)/i);
    /**
     * indicates whether executes in Android
     * @property isAndroid
     * @type {boolean}
     */
    Fire.isAndroid = !!(ua.match(/android/i) || nav.platform.match(/android/i));
}
else {
    Fire.isAndroid = Fire.isIOS = Fire.isMobile = false;
}

/**
 * !#en Check if running in retina display
 * !#zh 判断窗口是否显示在 Retina 显示器下。这个属性会随着窗口所在的显示器变化而变化
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Fire, 'isRetina', {
    get: function () {
        return Fire.isWeb && window.devicePixelRatio && window.devicePixelRatio > 1;
    }
});

/**
 * !#en Indicates whether retina mode is enabled currently. Retina mode is enabled by default for Apple device but disabled for other devices.
 * !#zh 判断当前是否启用 retina 渲染模式。Fire.isRetina 只是表示系统的支持状态，而最终是否启用 retina 则取决于 Fire.isRetinaEnabled。由于安卓太卡，这里默认禁用 retina。
 * @property isRetinaEnabled
 * @type {boolean}
 */
Fire.isRetinaEnabled = (Fire.isIOS || Fire.isDarwin) && !Fire.isEditor && Fire.isRetina;


// definitions for FObject._objFlags

var Destroyed = 1 << 0;
var ToDestroy = 1 << 1;
var DontSave = 1 << 2;
var EditorOnly  = 1 << 3;
var Dirty = 1 << 4;
var DontDestroy = 1 << 5;

/**
 * Bit mask that controls object states.
 * @class _ObjectFlags
 * @static
 * @private
 */
var ObjectFlags = {

    // public flags

    /**
     * The object will not be saved.
     * @property DontSave
     * @type number
     */
    DontSave: DontSave,

    /**
     * The object will not be saved when building a player.
     * @property EditorOnly
     * @type number
     */
    EditorOnly: EditorOnly,

    Dirty: Dirty,

    /**
     * Dont destroy automatically when loading a new scene.
     * @property DontDestroy
     * @private
     */
    DontDestroy: DontDestroy,

    // public flags for engine

    Destroying: 1 << 9,

    /**
     * Hide in game and hierarchy.
     * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
     * @property HideInGame
     * @type number
     */
    HideInGame: 1 << 10,

    // public flags for editor

    /**
     * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
     * @property HideInEditor
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
 * This flag is readonly, it can only be used as an argument of scene.addEntity() or Entity.createWithFlags()
 * @property Hide
 * @type number
 */
ObjectFlags.Hide = ObjectFlags.HideInGame | ObjectFlags.HideInEditor;

Fire._ObjectFlags = ObjectFlags;

var PersistentMask = ~(ToDestroy | Dirty | ObjectFlags.Destroying | DontDestroy |     // can not clone these flags
                       ObjectFlags.IsOnEnableCalled |
                       ObjectFlags.IsEditorOnEnabledCalled |
                       ObjectFlags.IsOnLoadCalled |
                       ObjectFlags.IsOnStartCalled);
