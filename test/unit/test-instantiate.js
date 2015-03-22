largeModule('Instantiate');

(function () {
    var match = function (obj, expect, info) {
        deepEqual(Fire.instantiate(obj), expect, info);
    };

    test('basic', function () {
        match({}, {}, 'smoke test1');

        match({ 1: 1, 2: [2, {3: '3'}]}, {1: 1, 2: [2, {3: '3'}]}, 'simple test1');

        var obj = {};
        var clone = Fire.instantiate({
            ref1: obj,
            ref2: obj,
        });
        strictEqual(clone.ref1, clone.ref2, 'should track the same reference');

        // test class

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
            Fire.JS.extend(MyAsset, _super);
            Fire.JS.setClassName('MyAsset', MyAsset);

            // should not instantiate --------------------------
            MyAsset.staticFunc = function () { };
            MyAsset.staticProp = Fire.defineEnum({
                UseBest: -1,
                Ascending: -1,
                Descending: -1
            });
            MyAsset.prototype.protoFunc = function () { };
            MyAsset.prototype.protoProp = 123;
            // -------------------------------------------------

            return MyAsset;
        })();
        var asset = new MyAsset();
        asset.dynamicProp = false;
        var expect = new MyAsset();
        expect.dynamicProp = false;

        var clone = Fire.instantiate(asset);

        strictEqual(asset.constructor, clone.constructor, 'instantiated should has the same type');
        deepEqual(clone, expect, 'can instantiate class');

        Fire.JS.unregisterClass(MyAsset);
    });

    test('Object', function () {
        var obj = new Fire.FObject();
        obj._objFlags = Fire._ObjectFlags.EditorOnly;

        var clone = Fire.instantiate(obj);

        strictEqual(clone._objFlags, Fire._ObjectFlags.EditorOnly, 'can clone obj flags');

        var hashObj = new Fire.HashObject();
        var id = hashObj.id;    // generate id
        var clonedHashObj = Fire.instantiate(hashObj);

        notEqual(clonedHashObj.id, id, 'should not clone id');
        notEqual(clonedHashObj.hashCode, hashObj.hashCode, 'should not clone hashCode');
    });

    test('FireClass', function () {
        var Sprite = Fire.define('Sprite', function () {
            this.image = 'sprite.png';
        });
        Sprite.prop('size', new Fire.Vec2(128, 128))
              .prop('_isValid', true, Fire.NonSerialized);

        var sprite = new Sprite();
        sprite.image = 'blabla';
        sprite.size = new Fire.Vec2(32, 2);
        sprite._isValid = false;

        var clone = Fire.instantiate(sprite);

        strictEqual(sprite.constructor, clone.constructor, 'instantiated should has the same type');
        deepEqual(clone.size, new Fire.Vec2(32, 2), 'can clone variable defined by property');
        strictEqual(clone.image, 'sprite.png', 'should not clone variable which not defined by property');
        strictEqual(clone._isValid, true, 'should not clone non-serialized field');

        Fire.JS.unregisterClass(Sprite);
    });

    test('Circular Reference', function () {
        function MyAsset () {
            // array1 = [1, array2]
            // array2 = [array1, 2]
            this.array1 = [1];
            this.array2 = [this.array1, 2];
            this.array1.push(this.array2);

            this.dict1 = {num: 1};
            this.dict2 = {num: 2, other: this.dict1};
            this.dict1.other = this.dict2;
        }
        var clone = Fire.instantiate(new MyAsset());

        deepEqual(new MyAsset(), clone, 'can instantiate');
        strictEqual(clone.array1[1], clone.array2, 'two arrays can circular reference each other 1');
        strictEqual(clone.array2[0], clone.array1, 'two arrays can circular reference each other 2');
        strictEqual(clone.dict1.other, clone.dict2, 'two dicts can circular reference each other 1');
        strictEqual(clone.dict2.other, clone.dict1, 'two dicts can circular reference each other 2');
    });

    test('asset reference', function () {
        var sprite = {};
        sprite.texture = new Fire.Texture();

        var clone = Fire.instantiate(sprite);

        strictEqual(sprite.texture, clone.texture, 'should not clone asset');
    });

})();
