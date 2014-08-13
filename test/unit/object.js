module('fobject');

var FObject = FIRE.FObject;

test('basic test', function () {
    var obj = new FObject();
    strictEqual(obj.__classname__, 'FIRE.FObject', 'class name');
    strictEqual(obj.isValid, true, 'valid');

    obj._destroyImmediate();

    strictEqual(obj.isValid, false, 'destroyed');
});

test('FObject.isValid', function () {
    var obj = new FObject();
    strictEqual(FObject.isValid(obj), true, 'valid');

    obj._destroyImmediate();

    strictEqual(FObject.isValid(obj), false, 'destroyed');

    delete obj;

    strictEqual(FObject.isValid(), false, 'undefined return false 1');
    strictEqual(FObject.isValid(obj), false, 'undefined return false 2');
    strictEqual(FObject.isValid(null), false, 'null return false');
});
