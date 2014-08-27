// jshint ignore: start

module('deserialize');

test('basic deserialize test', function () {

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
    asset.dynamicProp = false;

    var serializedAsset = FIRE.serialize(asset);
    var deserializedAsset = FIRE.deserialize(serializedAsset);

    equal(FIRE.serialize(deserializedAsset), FIRE.serialize(asset), 'test deserialize');
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

    var serializedAssetJson = '{"__type__":"MyAsset","emptyArray":[],"array":[1,"2",{"a":3},[4,[5]],true],"string":"unknown","number":1,"boolean":true,"emptyObj":{},"obj":{},"dynamicProp":false}';

    var deserializedAsset = FIRE.unserialize(deserializedAssetJson);

    

    var expectAsset = new MyAsset();
    expectAsset.dynamicProp = false;

    // TODO: how to deserialized constructor?
    deepEqual(deserializedAsset, expectAsset, 'json deserialize test');
});

test('circular reference deserialize test', function () {
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

    var serializedAssetJson = '[[1,[{"__id__":0},2]],[[1,{"__id__":1}],2],{"__type__":"MyAsset","array1":{"__id__":0},"array2":{"__id__":1}}]';
    var deserializedAsset = FIRE.unserialize(serializedAssetJson);

    deepEqual(unserializedAsset, expectAsset, 'two arrays can circular reference each other');

    //////

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

    serializedAssetJson = '[{"num":1,"__id__":0,"other":{"num":2,"other":{"__id__":0}}},{"num":2,"__id__":1,"other":{"num":1,"other":{"__id__":1}}},{"__type__":"MyAsset","dict1":{"__id__":0},"dict2":{"__id__":1}}]';
    unserializedAsset = FIRE.unserialize(serializedAssetJson);

    deepEqual(unserializedAsset, expectAsset, 'two dicts can circular reference each other');
});


test('tmp test', function () {
});
// jshint ignore: end