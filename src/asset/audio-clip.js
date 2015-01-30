Fire.AudioClip = (function () {
    var AudioClip = Fire.define("Fire.AudioClip", Fire.Asset, null);

    AudioClip.prop('rawData', null, Fire.RawType('audio'));

    return AudioClip;
})();
