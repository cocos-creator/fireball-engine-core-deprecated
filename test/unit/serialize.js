// jshint ignore: start

largeModule('Serialize');

var match = function (obj, expect, info) {
    deepEqual(JSON.parse(Fire.serialize(obj)), expect, info);
};

test('basic test', function() {
    match({}, {}, 'smoke test1');
    match([], [], 'smoke test2');

    var BaseAsset = function () {
        this.inheritProp = 321;
    };

    var MyAsset = (function () {
        var _super = BaseAsset;

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
        Fire.extend(MyAsset, _super);
        Fire.registerClass('MyAsset', MyAsset);

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
        inheritProp: 321
    };

    match(asset, expect, 'type test');
    match(asset, expect, 'test re-serialize again');

    Fire.unregisterClass(MyAsset);
});

test('nil', function () {
    var obj = {
        'null': null,
        'undefined': undefined,
    };
    var expect = '{\n\
    "null": null\n\
}'
    equal(Fire.serialize(obj), expect);
});

test('test type derived by Fire.define', function() {
    var MyAsset = Fire.define('MyAsset', Fire.Asset, function () {
                  this.array = [1, '2', {a:3}, [4, [5]], true];
                  })
                      .prop('emptyArray', [])
                      .prop('array', null)
                      .prop('string', 'unknown')
                      .prop('number', 1)
                      .prop('boolean', true)
                      .prop('emptyObj', {})
                      .prop('obj', {});

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

    var asset = new MyAsset();
    asset.dynamicProp = false;  // should not serialize

    var expect = {
        __type__: 'MyAsset',
        debugName: "",
        emptyArray: [],
        array: [1, '2',  {a:3}, [4, [5]], true],
        string: 'unknown',
        number: 1,
        boolean: true,
        emptyObj: {},
        obj: {},
    };

    match(asset, expect, 'type test');

    Fire.undefine(MyAsset);
});

test('test type created by Fire.define', function () {
    var Sprite = Fire.define('Sprite', function () {
        this.image = 'sprite.png';
    })
    Sprite.prop('size', new Fire.Vec2(128, 128));

    var sprite = new Sprite();
    var actual = JSON.parse(Fire.serialize(sprite));

    strictEqual(actual.image, undefined, 'should not serialize variable which not defined by property');

    var expected = {
        __type__: 'Sprite',
        size: {
            __type__: "Fire.Vec2",
            x: 128,
            y: 128
        }
    };

    deepEqual(actual, expected, 'can serialize');

    Fire.undefine(Sprite);
});

test('test circular reference', function () {
    var MyAsset = (function () {
        var _super = function () {};

        function MyAsset () {
            _super.call(this);
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);
            // array1 = [1, array2]
            // array2 = [array1, 2]
        }
        Fire.extend(MyAsset, _super);
        Fire.registerClass('MyAsset', MyAsset);

        return MyAsset;
    })();
    var asset = new MyAsset();

    var expect = [
        {
            __type__: 'MyAsset',
            array1: { __id__: 1 },
            array2: [ { __id__: 1 },  2 ],
        },
        [ 1,  [{ __id__: 1 }, 2] ],  // You'll get two copies of array2
    ];
    match(asset, expect, 'two arrays can circular reference each other');
    match(asset, expect, 'test re-serialize again');
    Fire.unregisterClass(MyAsset);

    MyAsset = (function () {
        var _super = function () {};

        function MyAsset () {
            _super.call(this);
            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        Fire.extend(MyAsset, _super);
        Fire.registerClass('MyAsset', MyAsset);

        return MyAsset;
    })();
    asset = new MyAsset();

    expect = [
        {
            __type__: 'MyAsset',
            dict1: { __id__: 1 },
            dict2: { /*__id__: 2,*/ num:2, other: {__id__: 1} },
        },
        { /*__id__: 1,*/ num:1, other: {num:2, other: {__id__: 1}} },  // You'll get two copies of dict2
    ];
    match(asset, expect, 'two dicts can circular reference each other');

    //asset.sameRef = asset.dict2;
    //expect[1].sameRef = { __id__: 1 };
    //match(asset, expect, 'more referenced object just serialize its id');

    Fire.unregisterClass(MyAsset);
});

test('test serializable attributes', function () {
    var Sprite = Fire.define('Sprite')
                     .prop('trimThreshold', 2, Fire.EditorOnly)
                     .prop('_isValid', true, Fire.NonSerialized);

    var sprite = new Sprite();
    var resultInEditor = JSON.parse(Fire.serialize(sprite));
    var resultInPlayer = JSON.parse(Fire.serialize(sprite, true));

    strictEqual(resultInEditor.trimThreshold, 2, 'serialize editor only in editor');
    strictEqual(resultInPlayer.trimThreshold, undefined, 'should not serialize editor only in player');

    strictEqual(resultInEditor._isValid, undefined, 'should not serialize non-serialized in editor');
    strictEqual(resultInPlayer._isValid, undefined, 'should not serialize non-serialized in player');

    Fire.undefine(Sprite);
});

test('test asset property', function () {
    var sprite = new Fire.Sprite();
    sprite.texture = new Fire.Texture();
    var uuid = '541020432560';
    sprite.texture._uuid = uuid;

    var result = JSON.parse(Fire.serialize(sprite));

    deepEqual(result.texture, {__uuid__: uuid}, 'serialize asset as uuid reference');
});

test('test FObject reference', function () {
    var fobj = new Fire.FObject();
    var asset = { ref1: fobj, ref2: fobj };
    var expected = [
        {
          "ref1": { "__id__": 1 },
          "ref2": { "__id__": 1 }
        },
        { "__type__": "Fire.FObject" },
    ];
    match(asset, expected, 'references should the same');
});

// jshint ignore: end
