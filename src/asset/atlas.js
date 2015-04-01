Fire.Atlas = (function () {

    var Atlas = Fire.extend("Fire.Atlas", Fire.Asset);

    // enum Algorithm
    Atlas.Algorithm = Fire.defineEnum({
        Basic: -1,
        Tree: -1,
        MaxRect: -1
    });

    // enum SortBy
    Atlas.SortBy = Fire.defineEnum({
        UseBest: -1,
        Width: -1,
        Height: -1,
        Area: -1,
        Name: -1
    });

    // enum SortOrder
    Atlas.SortOrder = Fire.defineEnum({
        UseBest: -1,
        Ascending: -1,
        Descending: -1
    });

    // basic settings
    Atlas.prop('width', 512, Fire.Integer_Obsoleted, Fire.ReadOnly );
    Atlas.prop('height', 512, Fire.Integer_Obsoleted, Fire.ReadOnly );

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
