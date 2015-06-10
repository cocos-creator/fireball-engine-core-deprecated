module('utils');

test('getVarFrom', function() {
    var foo = {
        bar: {
            value: "I'm foo.bar.value",
        }
    };
    var foobar = foo;
    foobar.value = foo.bar.value;
    equal( Fire.getVarFrom(foo,'bar.value'), "I'm foo.bar.value", "The value must be same" );
    equal( Fire.getVarFrom(foobar,'bar.value'), "I'm foo.bar.value", "The value must be same" );
    equal( Fire.getVarFrom(foobar,'value'), "I'm foo.bar.value", "The value must be same" );
    equal( Fire.getVarFrom(foobar,'hello.world'), null, "The value must be same" );
});

test('enum', function () {
    var TestEnum = Fire.defineEnum({
        Width: 1,
        Name: 20,
        UseBest: 0,
        Height: 10,
        Area: 15,
    });

    deepEqual ( Fire.getEnumList(TestEnum),
               [
                   { name: "UseBest", value: 0 },
                   { name: "Width", value: 1 },
                   { name: "Height", value: 10 },
                   { name: "Area", value: 15 },
                   { name: "Name", value: 20 },
               ],
               "The value must be same" );

    deepEqual ( Fire.getEnumList(Fire.defineEnum({
            '128': 128,
            256: 256,
            512: 512,
            1024: 1024,
            2048: 2048,
            4096: 4096,
        })),
        [
            { name: '128', value: 128 },
            { name: '256', value: 256 },
            { name: '512', value: 512 },
            { name: '1024', value: 1024 },
            { name: '2048', value: 2048 },
            { name: '4096', value: 4096 },
        ],
        "Can define enum name as index value" );
});
