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
    var TestEnum = (function (t) {
        t[t.Width   = 1] = 'Width';
        t[t.Name    = 20] = 'Name';
        t[t.UseBest = 0] = 'UseBest';
        t[t.Height  = 10] = 'Height';
        t[t.Area    = 15] = 'Area';
        return t;
    })({});

    deepEqual ( Fire.getEnumList(TestEnum), 
               [
                   { name: "UseBest", value: 0 },
                   { name: "Width", value: 1 },
                   { name: "Height", value: 10 },
                   { name: "Area", value: 15 },
                   { name: "Name", value: 20 },
               ],
               "The value must be same" ); 
});

test('CallbacksInvoker', function () {
    var ci = new Fire.CallbacksInvoker();
    
    var cb1 = new callback();
    var cb2 = new callback();
    var cb3 = new callback();
    strictEqual(ci.add('a', cb1), true, 'first cb key');
    strictEqual(ci.add('a', cb2), false, 'not first key');
    strictEqual(ci.add('b', cb3), true, 'another first key');

    cb1.enable();
    cb2.enable();
    ci.invoke('a');
    cb1.once('1 should be called');
    cb2.once('2 should be called');

    var invokeA = ci.bind('a');
    invokeA();
    cb1.once('1 should be called again').disable();
    cb2.once('2 should be called again').disable();

    cb3.enable();
    ci.invoke('b');
    cb3.once('3 should be called');

    ci.remove('a');
    ci.invoke('a'); // should not be called after removed
});
