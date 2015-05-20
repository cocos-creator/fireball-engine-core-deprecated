Fire.TextAsset = (function () {
    var TextAsset = Fire.Class({

        name: 'Fire.TextAsset',

        extends: Fire.Asset,

        properties: {
            text: {
                default: '',
                rawType: 'text',
                multiline: true
            }
        }
    });

    return TextAsset;
})();
