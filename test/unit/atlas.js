module('atlas');

test('test', function () {
    var atlas = new Fire.Atlas();
    ok(atlas instanceof Fire.Asset, 'atlas is instanceof Fire.Asset');
});
