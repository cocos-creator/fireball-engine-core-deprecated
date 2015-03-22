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
});

test('CallbacksInvoker', function () {
    var ci = new Fire.CallbacksInvoker();

    var cb1 = new Callback();
    var cb2 = new Callback();
    var cb3 = new Callback();
    strictEqual(ci.add('a', cb1), true, 'first cb key');
    strictEqual(ci.has('a', function () {}), false, '`has` should return false if the callback not exists');
    strictEqual(ci.has('a', cb1), true, '`has` should return true if the callback exists');
    strictEqual(ci.add('a', cb2), false, 'not first key');
    strictEqual(ci.add('b', cb3), true, 'another first key');
    strictEqual(ci.add('nil', undefined), true, 'null callback should also return true');

    cb1.enable();
    cb2.enable();
    ci.invoke('a');
    cb1.once('1 should be called');
    cb2.once('2 should be called');

    var invokeA = ci.bindKey('a');
    invokeA();
    cb1.once('1 should be called again').disable();
    cb2.once('2 should be called again').disable();

    cb3.enable();
    ci.invoke('b');
    cb3.once('3 should be called');

    ci.remove('a', cb2);
    cb2.setDisabledMessage('callback should not be invoked after removed');
    cb1.enable();
    ci.invoke('a');
    cb1.once('callback should still be invoked if not excatly the one being removed');

    ci.add('a', cb2);
    strictEqual(ci.has('a'), true, '`has` should return true if has any callback');
    ci.removeAll('a');
    strictEqual(ci.has('a'), false, '`has` should return false if all callbacks removed');
    cb1.setDisabledMessage('should not be called after all removed');
    cb2.setDisabledMessage('should not be called after all removed');
    ci.invoke('a');
});
