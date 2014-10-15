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
