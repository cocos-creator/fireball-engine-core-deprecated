// global definitions

FIRE.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);
FIRE.isNw = !!(FIRE.isNode && 'node-webkit' in process.versions);     // node-webkit
FIRE.isAs = !!(FIRE.isNode && 'atom-shell' in process.versions);      // atom-shell
FIRE.isApp = FIRE.isNw || FIRE.isAs;                                  // native client
FIRE.isPureWeb = !FIRE.isNode && !FIRE.isApp;                         // common web browser
FIRE.isEditor = FIRE.isApp;     // by far there is no standalone client version, so app == editor
if (FIRE.isAs) {
    FIRE.isWeb = typeof process !== 'undefined' && process.type === 'renderer';
}
else {
    FIRE.isWeb = (typeof __dirname === 'undefined' || __dirname === null); // common web browser, or window's render context in node-webkit or atom-shell
}

if (FIRE.isNode) {
    FIRE.isDarwin = process.platform === 'darwin';
    FIRE.isWin32 = process.platform === 'win32';
}
else {
    // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
    var platform = window.navigator.platform;
    FIRE.isDarwin = platform.substring(0, 3) === 'Mac';
    FIRE.isWin32 = platform.substring(0, 3) === 'Win';
}

// const flags

var Destroyed = 1 << 0;
var ToDestroy = 1 << 1;
var DontSave = 1 << 2;
var EditorOnly  = 1 << 3;       // dont save in build

FIRE.ObjectFlags = {
    DontSave: DontSave,
    EditorOnly: EditorOnly,
};

FIRE._ObjFlagIndex = {
    Engine: 9,  // engine start
    Editor: 18, // editor start
};
