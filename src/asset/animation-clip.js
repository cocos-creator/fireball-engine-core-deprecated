Fire.AnimationClip = Fire.Class({
    name: 'Fire.AnimationClip',
    extends: Fire.Asset,

    properties: {
        frames: {
            default: [],
            visible: false,
        },
        events: {
            default: [],
            visible: false,
        }
    },

    addProperty: function ( compName, propName ) {
        var result = this.frames.some( function ( item ) {
            return item.component === compName && item.property == propName;
        });
        if ( !result ) {
            this.frames.push({
                component: compName,
                property: propName,
                keys: [],
            });
        }
    },

    removeProperty: function ( compName, propName ) {
        for ( var i = 0; i < this.frames.length; ++i ) {
            var frame = this.frames[i];
            if ( frame.component === compName &&
                 frame.property === propName ) {
                this.frames.splice( i, 1 );
                break;
            }
        }
    },

    sort: function () {
        this.frames.sort( function ( a, b ) {
            if ( a.component !== b.component ) {
                return a.component.localeCompare(b.component);
            }
            return a.property.localeCompare( b.property );
        });
    },

    // frames structure:
    // [
    //     {
    //         component: 'foobar', property: 'hello', keys: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: 'linear' },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    //     {
    //         component: 'foobar', property: 'world', keys: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: 'linear' },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    // ]
});
