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
    };

    obj._destroyImmediate();

    strictEqual(obj.isValid, false, 'destroyed');

    obj._onPreDestroy = function () {
        ok(false, 'can only destroyed once');
    };
});

test('Fire.isValid', function () {
    var obj = new FObject();
    strictEqual(Fire.isValid(obj), true, 'valid');
    strictEqual(Fire.isValid(0), true, '0 is valid');

    obj._destroyImmediate();

    strictEqual(Fire.isValid(obj), false, 'destroyed');

    obj = undefined;

    strictEqual(Fire.isValid(), false, 'undefined return false 1');
    strictEqual(Fire.isValid(obj), false, 'undefined return false 2');
    strictEqual(Fire.isValid(null), false, 'null return false');
});

test('deferred destroy', function () {
    var obj = new FObject();

    obj._onPreDestroy = function () {
        ok(false, 'should not callback');
    }

    obj.destroy();

    // frame 1

    strictEqual(obj.isValid, true, 'still available in frame 1');
    strictEqual(Fire.isValid(obj), true, 'still available in frame 1');

    obj._onPreDestroy = function () {
        ok(true, 'should callback');
    }

    FObject._deferredDestroy();

    strictEqual(obj.isValid, false, 'deleted at the end of frame 1');
    strictEqual(Fire.isValid(obj), false, 'deleted at the end of frame 1');

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

test('destruct', function () {
    var obj1 = new FObject();

    // add dynamic value to instance
    obj1.function_value = function () {return 342};
    obj1.string_value = 'test string';
    obj1.object_value = [];

    obj1._destroyImmediate();
    equal(obj1.string_value, false, 'string value in instance will be null');
    equal(obj1.function_value, null, 'method in instance will be null');
    equal(obj1.object_value, null, 'object in instance will be null');
    ok(obj1._destruct, 'should not effect prototype method');

    // 原型继承测试
    var Sub = function () {
        FObject.call(this);
        this.array = [];
    };
    Sub.prototype.test_function = function () {return 342};
    Sub.prototype.test_boolean = true;
    Sub.prototype.test_string = 'test string';
    Fire.JS.extend(Sub, FObject);
    var inherited1 = new Sub();
    inherited1.object_value = [1,2];
    inherited1.function_value = {};
    inherited1.string_value = 'test string';

    var inherited2 = new Sub();

    inherited1._destroyImmediate();
    ok(!inherited1.object_value &&
       !inherited1.string_value &&
       !inherited1.function_value, 'should remove instance value');
    ok(inherited1._destruct, 'will not effect prototype method');
    ok(inherited2.array, 'should not effect other instance value');
});

module('HashObject');

test('test', function () {
    var obj1 = new Fire.HashObject();
    var obj2 = new Fire.HashObject();

    ok(obj1.hashCode, 'id is always true')
    strictEqual(typeof obj1.hashCode, 'number', 'hashCode is number');
    strictEqual(typeof obj2.id, 'string', 'id is string');

    notEqual(obj1.id, obj2.id, 'unique id');
    notEqual(obj1.hashCode, obj2.hashCode, 'unique hashCode');

    var id1 = obj1.hashCode;
    var key2 = obj2.id;

    var obj3 = new Fire.HashObject();

    strictEqual(obj1.hashCode, id1, 'hashCode not changed');
    strictEqual(obj2.id, key2, 'id not changed');
});
