Fire.Atlas = (function () {

    // enum Algorithm
    var Algorithm = Fire.defineEnum({
        Basic: -1,
        Tree: -1,
        MaxRect: -1
    });

    // enum SortBy
    var SortBy = Fire.defineEnum({
        UseBest: -1,
        Width: -1,
        Height: -1,
        Area: -1,
        Name: -1
    });

    // enum SortOrder
    var SortOrder = Fire.defineEnum({
        UseBest: -1,
        Ascending: -1,
        Descending: -1
    });


    var Atlas = Fire.Class({
        name: "Fire.Atlas",

        extends: Fire.Asset,

        properties: {
            // basic settings
            width: {
                default: 512,
                type: Fire.Integer,
                readonly: true
            },
            height: {
                default: 512,
                type: Fire.Integer,
                readonly: true
            },
            sprites: {
                default: [],
                type: Fire.Sprite,
                visible: false
            }
        },
        add: function ( sprite ) {
            for (var i = 0; i < this.sprites.length; ++i) {
                var sp = this.sprites[i];
                if ( sp._uuid === sprite._uuid ) {
                    return false;
                }
            }

            this.sprites.push(sprite);
            return true;
        },

        // remove sprite
        remove: function ( sprite ) {
            for (var i = 0; i < this.sprites.length; ++i) {
                var sp = this.sprites[i];
                if ( sp._uuid === sprite._uuid ) {
                    this.sprites.splice(i,1);
                    return true;
                }
            }

            return false;
        },

        // clear all sprites
        clear: function () {
            this.sprites = [];
        },

        layout: function ( opts ) {
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

            Editor.AtlasUtils.sort( this, opts.algorithm, opts.sortBy, opts.sortOrder, opts.allowRotate );
            Editor.AtlasUtils.layout( this, opts.algorithm, opts.autoSize, opts.padding, opts.allowRotate );
        }

    });

    Atlas.Algorithm = Algorithm;
    Atlas.SortBy = SortBy;
    Atlas.SortOrder = SortOrder;

    return Atlas;
})();
