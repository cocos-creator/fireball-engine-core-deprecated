largeModule('fobject');

var FObject = Fire.FObject;

test('basic test', function () {
    var obj = new FObject();
    strictEqual(obj.__classname__, 'Fire.FObject', 'class name');
    strictEqual(obj.isValid, true, 'valid');
});

test('destroyImmediate', 2, function () {
    var obj = new FObject();

    obj._onPreDestroy = function () {
        ok(true, 'destroy callback called');
    }

    obj._destroyImmediate();

    strictEqual(obj.isValid, false, 'destroyed');

    obj._onPreDestroy = function () {
        ok(false, 'can only destroyed once');
    }
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

test('destroy other at destroy callback', 3, function () {
    var obj1 = new FObject();
    var obj2 = new FObject();

    obj1.destroy();

    obj2._onPreDestroy = function () {
        ok(false, 'other should not destroyed this frame');
    }

    obj1._onPreDestroy = function () {
        obj2.destroy();
        strictEqual(obj2.isValid, true, 'other is valid until the end of next frame');
    }

    FObject._deferredDestroy();

    obj1._onPreDestroy = function () {
        ok(false, 'should not destroyed again');
    }
    obj2._onPreDestroy = function () {
        ok(true, "should called other's destroy callback at the end of next frame");
    }

    FObject._deferredDestroy();

    strictEqual(obj2.isValid, false, 'other should destroyed at the end of next frame');
});

module('HashObject');

test('test', function () {
    var obj1 = new Fire.HashObject();
    var obj2 = new Fire.HashObject();

    strictEqual(typeof obj1.hashId, 'number', 'id is number');
    strictEqual(typeof obj2.hashKey, 'string', 'key is string');

    notEqual(obj1.hashKey, obj2.hashKey, 'unique hashKey');
    notEqual(obj1.hashId, obj2.hashId, 'unique hashId');

    var id1 = obj1.hashId;
    var key2 = obj2.hashKey;

    var obj3 = new Fire.HashObject();

    strictEqual(obj1.hashId, id1, 'id not changed');
    strictEqual(obj2.hashKey, key2, 'key not changed');
});
