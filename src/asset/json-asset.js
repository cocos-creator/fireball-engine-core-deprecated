var JsonAsset = Fire.Class({
    name: 'Fire.JsonAsset',
    extends: Asset,
    properties: {
        json: {
            default: null,
            rawType: 'json',
            visible: false      // 显示出来会很卡
        }
    }
});

Fire.JsonAsset = JsonAsset;
