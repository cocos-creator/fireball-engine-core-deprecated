module('Attribute');

test('Fire.attr', function () {
    var MyCompBase = function () {
        this.baseVal = [];
    };

    Fire.attr(MyCompBase, 'baseVal', {
        data: 'waha'
    });

    strictEqual(Fire.attr(MyCompBase, 'baseVal').data, 'waha', 'can get attribute');

    Fire.attr(MyCompBase, 'baseVal').foo = { bar: 524 };
    strictEqual(Fire.attr(MyCompBase, 'baseVal').foo.bar, 524, 'can assign directly');

    var attr = Fire.attr(MyCompBase, 'baseVal', {
        cool: 'nice'
    });
    ok(attr.data && attr.cool && attr.foo, 'can merge multi attribute');

    Fire.attr(MyCompBase, 'baseVal', {
        data: false
    });
    strictEqual(attr.data, false, 'can override attribute');

    // inherit

    var MyComp = function () { };
    Fire.extend(MyComp, MyCompBase);
    var MyComp2 = function () { };
    Fire.extend(MyComp2, MyCompBase);

    strictEqual(Fire.attr(MyComp, 'baseVal').cool, 'nice', 'can get inherited attribute');

    Fire.attr(MyComp, 'subVal', {}).cool = 'very nice';
    strictEqual(Fire.attr(MyComp, 'subVal').cool, 'very nice', 'can have own attribute');

    strictEqual(Fire.attr(MyCompBase, 'subVal'), undefined, 'base class not pulluted');
    strictEqual(Fire.attr(MyComp2, 'subVal'), undefined, 'sibling class not pulluted');
});
