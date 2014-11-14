largeModule('vec2');

function v2 (x, y) {
    return new Fire.Vec2(x, y);
};

test('basic test', function () {
    var vec1 = new Fire.Vec2(5, 6);
    ok(vec1 instanceof Fire.Vec2, 'is instanceof');
    equal( vec1.x, 5, 'is that num' );
    var vec2 = vec1.clone();
    deepEqual(vec1, vec2, 'is the same');
    //var ccc = vec1.toString();
    //equal(ccc, '(5.00, 6.00)', 'can to string');
});

test('scale test', function () {
    var vec1 = new Fire.Vec2(5, 6);
    deepEqual(vec1.scale(v2(1, 2)), v2(5, 12), 'can scale');
    deepEqual(vec1, v2(5, 6), 'ensure vec1 not being changed after scale');
    deepEqual(vec1.scaleSelf(v2(1, 2)), v2(5, 12), 'can scaleSelf');
});

test('misc', function(){
    var vector = v2(7, 11);
    var vec1 = new Fire.Vec2(11, -42);
    strictEqual(vec1.dot(vector), -385, 'vec1 test');
    strictEqual(vec1.cross(vector), -415, 'corss test');
    strictEqual(vec1.magSqr(vector), 1885, 'magSqr test');
    
    var normalizeSelf = vec1.normalizeSelf();
    var mag = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
    var expect = v2(vec1.x / mag, vec1.y / mag);
    deepEqual(normalizeSelf, expect, 'normalizeSelf test');
});
