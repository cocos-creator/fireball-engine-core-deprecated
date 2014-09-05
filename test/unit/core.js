// jshint ignore: start

module('getClassName');

test('test', function() {
    var MyAsset = (function () {
        var _super = FIRE.Asset;

        function MyAsset () {
            _super.call(this);
        }
        FIRE.extend('Foo', MyAsset, _super);

        return MyAsset;
    })();
    var myAsset = new MyAsset();

    equal(FIRE.getClassName(myAsset), 'Foo', 'can getClassName of user type');

    delete MyAsset.prototype.__classname__;  // hack, remove class name
    ok(FIRE.getClassName(myAsset), 'should fallback to constructor name if classname undefined');
    // (constructor's name may renamed by uglify, so we do not test the value exactly)

    var asset = new FIRE.Asset();
    ok(FIRE.getClassName(asset), 'can getClassName of FIRE type');
    notEqual(FIRE.getClassName(myAsset), FIRE.getClassName(asset), 'class name should not achieved from its super');

    FIRE.unregisterNamedClass(MyAsset);
});

// jshint ignore: end
