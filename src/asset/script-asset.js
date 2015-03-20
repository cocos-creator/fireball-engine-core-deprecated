Fire.ScriptAsset = (function () {
    var ScriptAsset = Fire.extend("Fire.ScriptAsset", Fire.Asset);

    ScriptAsset.prop( 'text', '',
                      Fire.MultiText,
                      Fire.RawType('text'),
                      Fire.HideInInspector
                    );

    return ScriptAsset;
})();
