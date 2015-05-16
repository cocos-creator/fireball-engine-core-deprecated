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
                frames: [],
            });
        }
    },

    // frames structure:
    // [
    //     {
    //         component: 'foobar', property: 'hello', frames: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: 'linear' },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    //     {
    //         component: 'foobar', property: 'world', frames: [
    //             { frame: 0, value: 10, curve: [0,0.5,0.5,1] },
    //             { frame: 5, value: 15, curve: 'linear' },
    //             { frame: 10, value: 20, curve: null },
    //         ]
    //     },
    // ]
});
