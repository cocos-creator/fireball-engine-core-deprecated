module('matrix2x3');

test('basic', function () {
    var mat = new Fire.Matrix23();
    strictEqual(mat.a, 1);
    strictEqual(mat.b, 0);
    strictEqual(mat.c, 0);
    strictEqual(mat.d, 1);
    strictEqual(mat.tx, 0);
    strictEqual(mat.ty, 0);
    strictEqual(Fire.getClassName(mat), 'Fire.Matrix23');
    //Fire.log(mat);
});

test('clone', function () {
    var mat1 = new Fire.Matrix23();
    mat1.a = 123;
    mat1.b = 0;
    mat1.c = 1;
    mat1.d = 0.123;
    mat1.tx = 1.23;
    mat1.ty = 12.3;
    var mat2 = mat1.clone();
    deepEqual(mat1, mat2);
    mat1.d = 321;
    strictEqual(mat2.d, 0.123);
});

test('identity', function () {
    var mat = Fire.Matrix23.identity;
    strictEqual(mat.a, 1);
    strictEqual(mat.b, 0);
    strictEqual(mat.c, 0);
    strictEqual(mat.d, 1);
    strictEqual(mat.tx, 0);
    strictEqual(mat.ty, 0);
});

test('scale', function () {
    var mat = new Fire.Matrix23();
    var s = mat.getScale();
    strictEqual(s.x, 1);
    strictEqual(s.y, 1);

    mat.setScale(new Vec2(321, 0.4));
    s = mat.getScale();
    strictEqual(s.x, 321);
    strictEqual(s.y, 0.4);
});

test('invert', function () {
    var mat = new Fire.Matrix23();
    mat.setScale(new Vec2(321, 0.4));
    mat.rotate(Math.PI * 0.5);
    mat.tx = 10;  mat.ty = 22;
    var expected = mat.clone();
    mat.invert();
    mat.invert();
    deepClose(mat, expected, 0.0001, 'can invert');
});

test('rotate', function () {
    var mat = new Fire.Matrix23();
    mat.rotate(Math.PI * 0.5);
    strictEqual(mat.getRotation(), Math.PI * 0.5, 'can get set rotation');
});

test('transform', function () {
    var rm = new Fire.Matrix23();
    rm.rotate(Math.PI * 0.5);
    
    var sm = new Fire.Matrix23();
    sm.setScale(new Fire.Vec2(7, 2));

    var point = new Vec2(10, -5);
    var expected = new Vec2(10, 70);

    var scaled = sm.transformPoint(point);
    var scaledRotated = rm.transformPoint(scaled);

    deepClose(scaledRotated, expected, 0.0001, 'scale then rotate');
});

test('prepend', function () {
    var rm = new Fire.Matrix23();
    rm.rotate(Math.PI * 0.5);
    
    var sm = new Fire.Matrix23();
    sm.setScale(new Fire.Vec2(7, 2));

    var point = new Vec2(10, -5);
    var expected = new Vec2(10, 70);

    var mat = sm.prepend(rm);
    var actual = mat.transformPoint(point);

    deepClose(actual, expected, 0.0001, 'use preMultiplied matrix to scale then rotate');
});
