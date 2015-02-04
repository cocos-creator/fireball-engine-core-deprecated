Fire.Atlas = (function () {

    var Atlas = Fire.define("Fire.Atlas", Fire.Asset, null);  // supply a null constructor to explicitly indicates that
                                                              // inherit from Asset, because Asset not defined by Fire.define

    // enum Algorithm
    Atlas.Algorithm = (function (t) {
        t[t.Basic   = 0] = 'Basic';
        t[t.Tree    = 1] = 'Tree';
        t[t.MaxRect = 2] = 'MaxRect';
        return t;
    })({});

    // enum SortBy
    Atlas.SortBy = (function (t) {
        t[t.UseBest = 0] = 'UseBest';
        t[t.Width   = 1] = 'Width';
        t[t.Height  = 2] = 'Height';
        t[t.Area    = 3] = 'Area';
        t[t.Name    = 4] = 'Name';
        return t;
    })({});

    // enum SortOrder
    Atlas.SortOrder = (function (t) {
        t[t.UseBest    = 0] = 'UseBest';
        t[t.Ascending  = 1] = 'Ascending';
        t[t.Descending = 2] = 'Descending';
        return t;
    })({});

    // basic settings
    Atlas.prop('autoSize', true);
    Atlas.prop('width', 512, Fire.Integer );
    Atlas.prop('height', 512, Fire.Integer );

    Atlas.prop('sprites', [], Fire.HideInInspector);

    //
    Atlas.prototype.add = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var t = this.sprites[i];
            if ( t.name === sprite.name ) {
                this.sprites[i] = sprite;
                return;
            }
        }

        this.sprites.push(sprite);
    };

    // remove sprite
    Atlas.prototype.remove = function ( sprite ) {
        var idx = this.sprites.indexOf(sprite);
        if ( idx !== -1 ) {
            this.sprites.splice(idx,1);
        }
    };

    // clear all sprites
    Atlas.prototype.clear = function () {
        this.sprites.length = 0;
    };

    return Atlas;
})();
