module('getClassName');

test('test getClassName', function() {
    var MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
        }
        FIRE.extend(MyAsset, _super);
        MyAsset.prototype.__classname__ = 'Foo';

        return MyAsset;
    })();
    var myAsset = new MyAsset();

    equal(FIRE.getClassName(myAsset), 'Foo', 'can getClassName of user type');

    delete MyAsset.prototype.getClassName;
    ok(FIRE.getClassName(myAsset), 'should fallback to constructor name if classname not defined');
    // (constructor's name may renamed by uglify, so we do not test the value exactly)

    var asset = new FIRE.Asset();
    ok(FIRE.getClassName(asset), 'can getClassName of FIRE type');
    notEqual(FIRE.getClassName(myAsset), FIRE.getClassName(asset), 'class name should not achieved from its super');
});

module('serialize');

var match = function (obj, expect, info) {
    deepEqual(JSON.parse(FIRE.serialize(obj)), expect, info);
};

test('basic test', function() {
    match({}, {}, 'smoke test1');
    match([], [], 'smoke test2');

    var MyAsset = (function () {
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
        FIRE.extend(MyAsset, _super);
        MyAsset.prototype.__classname__ = 'MyAsset';

        // should not serialize ----------------------------
        MyAsset.staticFunc = function () { };
        MyAsset.staticProp = (function (t) {
            t[t.UseBest    = 0] = 'UseBest';
            t[t.Ascending  = 1] = 'Ascending';
            t[t.Descending = 2] = 'Descending';
            return t;
        })({});
        MyAsset.prototype.protoFunc = function () { };
        MyAsset.prototype.protoProp = 123;
        // -------------------------------------------------

        return MyAsset;
    })();
    var asset = new MyAsset();
    asset.dynamicProp = false;

    var expect = {
        __type__: 'MyAsset',
        emptyArray: [],
        array: [1, '2',  {a:3}, [4, [5]], true],
        string: 'unknown',
        number: 1,
        boolean: true,
        emptyObj: {},
        obj: {},
        dynamicProp: false,
    };

    match(asset, expect, 'type test');
    match(asset, expect, 'test re-serialize again');
});

test('test circular reference', function () {
    var MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]
        }
        FIRE.extend(MyAsset, _super);
        MyAsset.prototype.__classname__ = 'MyAsset';

        return MyAsset;
    })();
    var asset = new MyAsset();

    var expect = [
        [ 1,  [{ __id__: 0 }, 2] ],  // You'll get two copies of array2
        [ [1, {__id__: 1}],  2 ],    // You'll get two copies of array1
        {
            __type__: 'MyAsset',
            array1: { __id__: 0 },
            array2: { __id__: 1 },
        }
    ];
    match(asset, expect, 'two arrays can circular reference each other');
    match(asset, expect, 'test re-serialize again');
    MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        FIRE.extend(MyAsset, _super);
        MyAsset.prototype.__classname__ = 'MyAsset';

        return MyAsset;
    })();
    asset = new MyAsset();

    expect = [
        { __id__: 0, num:1, other: {num:2, other: {__id__: 0}} },  // You'll get two copies of dict2
        { __id__: 1, num:2, other: {num:1, other: {__id__: 1}} },  // You'll get two copies of dict1
        {
            __type__: 'MyAsset',
            dict1: { __id__: 0 },
            dict2: { __id__: 1 },
        }
    ];
    match(asset, expect, 'two dicts can circular reference each other');

    asset.sameRef = asset.dict2;
    expect[2].sameRef = { __id__: 1 };
    match(asset, expect, 'more referenced object just serialize its id');
});
