module('atlas');

test('test', function () {
    var atlas = new FIRE.Atlas();
    ok(atlas instanceof FIRE.Asset, 'atlas is instanceof FIRE.Asset');
});
