module('fobject');

var FObject = FIRE.FObject;

test('basic test', function () {
    var obj = new FObject();
    strictEqual(obj.__classname__, 'FIRE.FObject', 'class name');
    strictEqual(obj.isValid, true, 'valid');
});

test('destroyImmediate', function () {
    expect(2);

    var obj = new FObject();

    obj._onPreDestroy = function () {
        ok(true, 'destroy callback called');
    }

    obj._destroyImmediate();

    strictEqual(obj.isValid, false, 'destroyed');

    obj._onPreDestroy = function () {
        ok(false, 'can only destroyed once');
    }

    var error = console.error;
    console.error = function () {}  // forbid error

    obj._destroyImmediate();

    console.error = error;
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

test('deferred destroy', function () {
    var obj = new FObject();

    obj._onPreDestroy = function () {
        ok(false, 'should not callback');
    }

    obj.destroy();

    // frame 1

    strictEqual(obj.isValid, true, 'still available in frame 1');
    strictEqual(FObject.isValid(obj), true, 'still available in frame 1');

    obj._onPreDestroy = function () {
        ok(true, 'should callback');
    }

    FObject._deferredDestroy();

    strictEqual(obj.isValid, false, 'deleted at the end of frame 1');
    strictEqual(FObject.isValid(obj), false, 'deleted at the end of frame 1');

    obj._onPreDestroy = function () {
        ok(false, 'should not callback anymore');
    }

    // frame 2

    var obj2 = new FObject();
    obj2.destroy();

    strictEqual(obj2.isValid, true, 'still available in frame 2');

    FObject._deferredDestroy();

    strictEqual(obj2.isValid, false, 'deleted at the end of frame 2');
});

test('multiply deferred destroy', function () {
    var obj1 = new FObject();
    var obj2 = new FObject();

    obj1.destroy();
    obj2.destroy();

    strictEqual(obj1.isValid, true, 'still available in this frame');
    strictEqual(obj2.isValid, true, 'still available in this frame');

    obj2._onPreDestroy = function () {
        ok(true, 'should callback');
    }

    FObject._deferredDestroy();

    strictEqual(obj1.isValid, false, 'deleted at the end of frame');
    strictEqual(obj2.isValid, false, 'deleted at the end of frame');
});
