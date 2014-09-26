// jshint ignore: start

module('getClassName');

test('test', function() {
    var MyAsset = (function () {
        var _super = Fire.Asset;

        function MyAsset () {
            _super.call(this);
        }
        Fire.extend(MyAsset, _super);
        Fire.registerClass('Foo', MyAsset);

        return MyAsset;
    })();
    var myAsset = new MyAsset();

    equal(Fire.getClassName(myAsset), 'Foo', 'can getClassName of user type');

    delete MyAsset.prototype.__classname__;  // hack, remove class name
    ok(Fire.getClassName(myAsset), 'should fallback to constructor name if classname undefined');
    // (constructor's name may renamed by uglify, so we do not test the value exactly)

    var asset = new Fire.Asset();
    ok(Fire.getClassName(asset), 'can getClassName of Fire type');
    notEqual(Fire.getClassName(myAsset), Fire.getClassName(asset), 'class name should not achieved from its super');

    Fire.unregisterClass(MyAsset);
});

// jshint ignore: end
