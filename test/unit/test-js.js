// jshint ignore: start

module('getClassName');

test('test', function() {
    var MyAsset = (function () {
        var _super = Fire.Asset;

        function MyAsset () {
            _super.call(this);
        }
        Fire.JS.extend(MyAsset, _super);
        Fire.JS.setClassName('Foo', MyAsset);

        return MyAsset;
    })();
    var myAsset = new MyAsset();

    equal(Fire.JS.getClassName(myAsset), 'Foo', 'can getClassName of user type');

    delete MyAsset.prototype.__classname__;  // hack, remove class name
    ok(Fire.JS.getClassName(myAsset), 'should fallback to constructor name if classname undefined');
    // (constructor's name may renamed by uglify, so we do not test the value exactly)

    var asset = new Fire.Asset();
    ok(Fire.JS.getClassName(asset), 'can getClassName of FireClass');
    notEqual(Fire.JS.getClassName(myAsset), Fire.JS.getClassName(asset), 'class name should not achieved from its super');

    Fire.JS.unregisterClass(MyAsset);
});

// jshint ignore: end
