Fire.Atlas = (function () {

    var Atlas = Fire.extend("Fire.Atlas", Fire.Asset);

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
    Atlas.prop('width', 512, Fire.Integer, Fire.ReadOnly );
    Atlas.prop('height', 512, Fire.Integer, Fire.ReadOnly );

    Atlas.prop('sprites', [], Fire.ObjectType(Fire.Sprite), Fire.HideInInspector);

    //
    Atlas.prototype.add = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sp = this.sprites[i];
            if ( sp._uuid === sprite._uuid ) {
                return false;
            }
        }

        this.sprites.push(sprite);
        return true;
    };

    // remove sprite
    Atlas.prototype.remove = function ( sprite ) {
        for (var i = 0; i < this.sprites.length; ++i) {
            var sp = this.sprites[i];
            if ( sp._uuid === sprite._uuid ) {
                this.sprites.splice(i,1);
                return true;
            }
        }

        return false;
    };

    // clear all sprites
    Atlas.prototype.clear = function () {
        this.sprites = [];
    };

    Atlas.prototype.layout = function ( opts ) {
        if ( opts.algorithm === undefined )
            opts.algorithm = Fire.Atlas.Algorithm.MaxRect;

        if ( opts.sortBy === undefined )
            opts.sortBy = Fire.Atlas.SortBy.UseBest;

        if ( opts.sortOrder === undefined )
            opts.sortOrder = Fire.Atlas.SortOrder.UseBest;

        if ( opts.allowRotate === undefined )
            opts.allowRotate = true;

        if ( opts.autoSize === undefined )
            opts.autoSize = true;

        if ( opts.padding === undefined )
            opts.padding = 2;

        Fire.AtlasUtils.sort( this, opts.algorithm, opts.sortBy, opts.sortOrder, opts.allowRotate );
        Fire.AtlasUtils.layout( this, opts.algorithm, opts.autoSize, opts.padding, opts.allowRotate );
    };

    return Atlas;
})();
