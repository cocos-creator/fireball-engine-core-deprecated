// jshint ignore: start

module('deserialize');

test('basic deserialize test', function () {
    deepEqual(FIRE.deserialize({}), {}, 'smoke test1');
    deepEqual(FIRE.deserialize([]), [], 'smoke test2');

    // TODO:
    MyAsset = (function () {
        var _super = FIRE.Asset;

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
        FIRE.extend('MyAsset', MyAsset, _super);
        return MyAsset;
    })();

    var asset = new MyAsset();
    var serializedAsset = FIRE.serialize(asset);
    var deserializedAsset = FIRE.deserialize(serializedAsset);

    deepEqual(deserializedAsset, asset, 'test deserialize');

    FIRE.unregisterNamedClass(MyAsset);
});

test('json deserialize test', function () {

    // TODO:
    MyAsset = (function () {
        var _super = FIRE.Asset;

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
        FIRE.extend('MyAsset', MyAsset, _super);
        return MyAsset;
    })();

    var jsonStr = '{"__type__":"MyAsset","emptyArray":[],"array":[1,"2",{"a":3},[4,[5]],true],"string":"unknown","number":1,"boolean":true,"emptyObj":{},"obj":{},"dynamicProp":false}';

    var deserializedAsset = FIRE.deserialize(jsonStr);

    var expectAsset = new MyAsset();

    deepEqual(deserializedAsset, expectAsset, 'json deserialize test');

    FIRE.unregisterNamedClass(MyAsset);
});

test('reference to main asset', function () {
    var asset = {};
    asset.refSelf = asset;
    /*  [
            {
                "refSelf": {
                    "__id__": 0
                }
            },
            {
                "__id__": 0
            }
        ] 
     */

    var serializedAsset = FIRE.serialize(asset);
    var deserializedAsset = FIRE.deserialize(serializedAsset);
    
    ok(deserializedAsset.refSelf === deserializedAsset, 'should ref to self');
    //deepEqual(FIRE.serialize(deserializedAsset), serializedAsset, 'test deserialize');
});

test('circular reference by object', function () {
    var MyAsset = (function () {
        function MyAsset () {
            _super.call(this);
            this.refSelf = this;
            this.refToMain = null;
        }
        var _super = FIRE.extend('MyAsset', MyAsset, FIRE.Asset);
        return MyAsset;
    })();
    
    var asset = new MyAsset();
    var mainAsset = { myAsset: asset };
    asset.refToMain = mainAsset;

    var serializedAsset = FIRE.serialize(mainAsset, false, false);
    var deserializedAsset = FIRE.deserialize(serializedAsset);
    
    ok(deserializedAsset.myAsset.refSelf === deserializedAsset.myAsset, 'sub asset should ref to itself');
    ok(deserializedAsset.myAsset.refToMain === deserializedAsset, 'sub asset should ref to main');

    deepEqual(deserializedAsset, mainAsset, 'can ref');

    FIRE.unregisterNamedClass(MyAsset);
});

test('circular reference by array', function () {
    MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]
        }
        FIRE.extend('MyAsset', MyAsset, _super);

        return MyAsset;
    })();

    var expectAsset = new MyAsset();
    var json = '[[1,[{"__id__":0},2]],[[1,{"__id__":1}],2],{"__type__":"MyAsset","array1":{"__id__":0},"array2":{"__id__":1}}]';
    var deserializedAsset = FIRE.deserialize(json);

    deepEqual(deserializedAsset, expectAsset, 'two arrays can circular reference each other');
    strictEqual(deserializedAsset.array1[1][0], deserializedAsset.array1, 'two arrays can circular reference each other 1');
    strictEqual(deserializedAsset.array2[0][1], deserializedAsset.array2, 'two arrays can circular reference each other 2');

    FIRE.unregisterNamedClass(MyAsset);
});

test('circular reference by dict', function () {
    MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        FIRE.extend('MyAsset', MyAsset, _super);

        return MyAsset;
    })();
    expectAsset = new MyAsset();

    serializedAssetJson = '[{"num":1,"other":{"num":2,"other":{"__id__":0}}},{"num":2,"other":{"num":1,"other":{"__id__":1}}},{"__type__":"MyAsset","dict1":{"__id__":0},"dict2":{"__id__":1}}]';
    deserializedAsset = FIRE.deserialize(serializedAssetJson);

    deepEqual(deserializedAsset, expectAsset, 'two dicts can circular reference each other');
    strictEqual(deserializedAsset.dict1.other.other, deserializedAsset.dict1, 'two dicts can circular reference each other 1');
    strictEqual(deserializedAsset.dict2.other.other, deserializedAsset.dict2, 'two dicts can circular reference each other 2');

    FIRE.unregisterNamedClass(MyAsset);
});

// jshint ignore: end
