module('enum');

test('basic test', function() {

    TestEnum = (function (t) {
        t[t.Width   = 1] = 'Width';
        t[t.Name    = 20] = 'Name';
        t[t.UseBest = 0] = 'UseBest';
        t[t.Height  = 10] = 'Height';
        t[t.Area    = 15] = 'Area';
        return t;
    })({});

    deepEqual ( FIRE.getEnumList(TestEnum), 
               [
                   { name: "UseBest", value: 0 },
                   { name: "Width", value: 1 },
                   { name: "Height", value: 10 },
                   { name: "Area", value: 15 },
                   { name: "Name", value: 20 },
               ],
               "The value must be same" ); 
});
