// jshint ignore: start

largeModule('Deserialize');

function testWithTarget (name, testFunc) {
    test(name, function () {
        testFunc(false);
    });
    test(name + ' with target', function () {
        testFunc(true);
    });
}

test('basic deserialize test', function () {
    deepEqual(Fire.deserialize({}), {}, 'smoke test1');
    deepEqual(Fire.deserialize([]), [], 'smoke test2');

    // TODO:
    var MyAsset = (function () {
        function MyAsset () {
            this.emptyArray = [];
            this.array = [1, '2', {a:3}, [4, [5]], true];
            this.string = 'unknown';
            this.emptyString = '';
            this.number = 1;
            this.boolean = true;
            this.emptyObj = {};
            this.embeddedTypedObj = new Vec2(1, 2.1);
        }
        Fire.JS.setClassName('MyAsset', MyAsset);
        return MyAsset;
    })();

    var asset = new MyAsset();
    var serializedAsset = Fire.serialize(asset);
    delete asset.__id__;
    var deserializedAsset = Fire.deserialize(serializedAsset);

    deepEqual(deserializedAsset, asset, 'test deserialize');

    Fire.JS.unregisterClass(MyAsset);
});

test('basic deserialize test with target', function () {
    deepEqual(Fire.deserialize({}, null, { target: {} }), {}, 'smoke test1');
    deepEqual(Fire.deserialize([], null, { target: [] }), [], 'smoke test2');

    // TODO:
    var MyAsset = (function () {
        function MyAsset () {
            this.emptyArray = [];
            this.array = [1, '2', {a:3}, [4, [5]], true];
            this.string = 'unknown';
            this.emptyString = '';
            this.number = 1;
            this.boolean = true;
            this.emptyObj = {};
            this.embeddedTypedObj = new Vec2(1, 2.1);
        }
        Fire.JS.setClassName('MyAsset', MyAsset);
        return MyAsset;
    })();
    var asset = new MyAsset();
    var serializedAsset = Fire.serialize(asset);
    delete asset.__id__;

    var newObj = {a:100};
    var newArray = [3, '8', newObj, [4, [9]], false];
    asset.array = newArray;

    var deserializedAsset = Fire.deserialize(serializedAsset, null, {target: asset});

    strictEqual(deserializedAsset, asset, 'ref should not changed');
    strictEqual(deserializedAsset.array, newArray, 'embedded array ref should not changed');
    deepEqual(newArray, [1, '2', {a:3}, [4, [5]], true], 'embedded array should restored');
    strictEqual(deserializedAsset.array[2], newObj, 'embedded obj ref should not changed');
    deepEqual(newObj, {a:3}, 'embedded obj should restored');

    Fire.JS.unregisterClass(MyAsset);
});

test('nil', function () {
    var obj = {
        'null': null,
    };
    var str = '{ "null": null }'
    deepEqual(Fire.deserialize(str), obj, 'can deserialize null');

    var MyAsset = Fire.define('MyAsset', function () {
        this.foo = 'bar';
    }).prop('nil', 1234);

    str = '{ "__type__": "MyAsset" }'
    obj = new MyAsset();
    deepEqual(Fire.deserialize(str), obj, 'use default value');

    str = '{ "__type__": "MyAsset", "nil": null }'
    obj = new MyAsset();
    obj.nil = null;
    deepEqual(Fire.deserialize(str), obj, 'can override as null');

    Fire.JS.unregisterClass(MyAsset);
});

test('nil with target', function () {
    var obj = {
        'null': null,
    };
    var str = '{ "null": null }'
    deepEqual(Fire.deserialize(str, null, {target: null}), obj, 'can deserialize null');
});

test('json deserialize test', function () {

    // TODO:
    var MyAsset = (function () {
        var _super = Fire.Asset;

        function MyAsset () {
            _super.call(this);

            this.emptyArray = [];
            this.array = [1, '2', {a:3}, [4, [5]], true];
            this.string = 'unknown';
            this.number = 1;
            this.boolean = true;
            this.emptyObj = {};
            this.obj = {};

        }
        Fire.JS.extend(MyAsset, _super);
        Fire.JS.setClassName('MyAsset', MyAsset);
        return MyAsset;
    })();

    var jsonStr = '{"__type__":"MyAsset","emptyArray":[],"array":[1,"2",{"a":3},[4,[5]],true],"string":"unknown","number":1,"boolean":true,"emptyObj":{},"obj":{},"dynamicProp":false}';

    var deserializedAsset = Fire.deserialize(jsonStr);

    var expectAsset = new MyAsset();

    deepEqual(deserializedAsset, expectAsset, 'json deserialize test');

    Fire.JS.unregisterClass(MyAsset);
});

test('reference to main asset', function () {
    var asset = {};
    asset.refSelf = asset;
    /*  {
            "refSelf": {
                "__id__": 0
            }
        }
     */

    var serializedAsset = Fire.serialize(asset);
    var deserializedAsset = Fire.deserialize(serializedAsset);

    ok(deserializedAsset.refSelf === deserializedAsset, 'should ref to self');
    //deepEqual(Fire.serialize(deserializedAsset), serializedAsset, 'test deserialize');
});

test('reference to main asset with target', function () {
    var asset = {};
    asset.refSelf = asset;
    var serializedAsset = Fire.serialize(asset);

    asset.refSelf = null;

    var deserializedAsset = Fire.deserialize(serializedAsset, null, {target: asset});
    ok(deserializedAsset.refSelf === deserializedAsset, 'should ref to self');
});

testWithTarget('circular reference by object', function (useTarget) {
    var MyAsset = (function () {
        var _super = Fire.Asset;
        function MyAsset () {
            _super.call(this);
            this.refSelf = this;
            this.refToMain = null;
        }
        Fire.JS.extend(MyAsset, Fire.Asset);
        Fire.JS.setClassName('MyAsset', MyAsset);
        return MyAsset;
    })();

    var asset = new MyAsset();
    var mainAsset = { myAsset: asset };
    asset.refToMain = mainAsset;

    var serializedAsset = Fire.serialize(mainAsset);
    delete mainAsset.__id__;
    delete asset.__id__;
    var deserializedAsset = Fire.deserialize(serializedAsset, null, useTarget ? {target: mainAsset} : null);

    ok(deserializedAsset.myAsset.refSelf === deserializedAsset.myAsset, 'sub asset should ref to itself');
    ok(deserializedAsset.myAsset.refToMain === deserializedAsset, 'sub asset should ref to main');

    deepEqual(deserializedAsset, mainAsset, 'can ref');

    Fire.JS.unregisterClass(MyAsset);
});

testWithTarget('circular reference by array', function (useTarget) {
    var MyAsset = (function () {
        var _super = Fire.Asset;

        function MyAsset () {
            _super.call(this);
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]
        }
        Fire.JS.extend(MyAsset, _super);
        Fire.JS.setClassName('MyAsset', MyAsset);

        return MyAsset;
    })();

    var expectAsset = new MyAsset();
    //Fire.log(Fire.serialize(expectAsset));
    var json = '[{"__type__":"MyAsset","array1":{"__id__":1},"array2":{"__id__":2}},[1,{"__id__":2}],[{"__id__":1},2]]';
    var deserializedAsset = Fire.deserialize(json, null, useTarget ? {target: expectAsset} : null);

    deepEqual(deserializedAsset, expectAsset, 'two arrays can circular reference each other');
    strictEqual(deserializedAsset.array1[1][0], deserializedAsset.array1, 'two arrays can circular reference each other 1');
    strictEqual(deserializedAsset.array2[0][1], deserializedAsset.array2, 'two arrays can circular reference each other 2');

    Fire.JS.unregisterClass(MyAsset);
});

testWithTarget('circular reference by dict', function (useTarget) {
    var MyAsset = (function () {
        var _super = Fire.Asset;

        function MyAsset () {
            _super.call(this);
            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        Fire.JS.extend(MyAsset, _super);
        Fire.JS.setClassName('MyAsset', MyAsset);

        return MyAsset;
    })();
    var expectAsset = new MyAsset();

    var serializedAssetJson = '[{"__type__":"MyAsset","dict1":{"__id__":1},"dict2":{"__id__":2}},{"num":1,"other":{"__id__":2}},{"num":2,"other":{"__id__":1}}]';
    var deserializedAsset = Fire.deserialize(serializedAssetJson, null, useTarget ? {target: expectAsset} : null);

    deepEqual(deserializedAsset, expectAsset, 'two dicts can circular reference each other');
    strictEqual(deserializedAsset.dict1.other.other, deserializedAsset.dict1, 'two dicts can circular reference each other 1');
    strictEqual(deserializedAsset.dict2.other.other, deserializedAsset.dict2, 'two dicts can circular reference each other 2');

    Fire.JS.unregisterClass(MyAsset);
});

test('target', function () {
    var MyAsset = (function () {
        var MyAsset = Fire.define( 'MyAsset', function () {
            this.tmpVal = 0;
        }).prop('saveVal', 0);

        return MyAsset;
    })();

    var myAsset = new MyAsset();
    myAsset.tmpVal = 321;
    myAsset.saveVal = 111;
    var data = Fire.serialize(myAsset);
    myAsset.saveVal = 0;

    var newAsset = Fire.deserialize(data, null, { target:myAsset });

    strictEqual(newAsset, myAsset, 'target reference not changed');
    strictEqual(myAsset.tmpVal, 321, 'tmp member of target not changed');
    strictEqual(myAsset.saveVal, 111, 'serialized member of target reloaded');

    Fire.JS.unregisterClass(MyAsset);
});

// jshint ignore: end
