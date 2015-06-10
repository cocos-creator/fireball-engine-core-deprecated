
module('HashObject');

test('test', function () {
    var obj1 = new Fire.HashObject();
    var obj2 = new Fire.HashObject();

    ok(obj1.hashCode, 'id is always true')
    strictEqual(typeof obj1.hashCode, 'number', 'hashCode is number');
    strictEqual(typeof obj2.id, 'string', 'id is string');

    notEqual(obj1.id, obj2.id, 'unique id');
    notEqual(obj1.hashCode, obj2.hashCode, 'unique hashCode');

    var id1 = obj1.hashCode;
    var key2 = obj2.id;

    var obj3 = new Fire.HashObject();

    strictEqual(obj1.hashCode, id1, 'hashCode not changed');
    strictEqual(obj2.id, key2, 'id not changed');
});
