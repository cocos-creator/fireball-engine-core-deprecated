Fire.ScriptAsset = (function () {
    var ScriptAsset = Fire.Class({

        name: "Fire.ScriptAsset",

        extends: Fire.Asset,

        properties: {
            text: {
                default: '',
                rawType: 'text',
                multiline: true,
                visible: false
            }
        }
    });

    return ScriptAsset;
})();
