module('Attribute');

test('base', function () {
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
    strictEqual(attr.data, false, 'can change attribute');

    // inherit

    var MyComp1 = function () { };
    Fire.JS.extend(MyComp1, MyCompBase);
    var MyComp2 = function () { };
    Fire.JS.extend(MyComp2, MyCompBase);

    strictEqual(Fire.attr(MyComp1, 'baseVal').cool, 'nice', 'can get inherited attribute');
    Fire.attr(MyComp1, 'baseVal', {cool: 'good'});
    strictEqual(Fire.attr(MyComp1, 'baseVal').cool, 'good', 'can override inherited attribute');

    // yes, current implement of attr is not based on real javascript prototype
    strictEqual(Fire.attr(MyCompBase, 'baseVal').cool, 'good', 'Oh yes, sub prop of base class will be pulluted!');

    Fire.attr(MyComp1, 'subVal', {}).cool = 'very nice';
    strictEqual(Fire.attr(MyComp1, 'subVal').cool, 'very nice', 'can have own attribute');

    strictEqual(Fire.attr(MyCompBase, 'subVal'), undefined, 'main prop of base class not pulluted');
    strictEqual(Fire.attr(MyComp2, 'subVal'), undefined, 'sibling class not pulluted');
});

test('not object type', function () {
    var MyCompBase = function () {};
    Fire.attr(MyCompBase, 'subVal', false);
    strictEqual(Fire.attr(MyCompBase, 'subVal'), false, 'attr should set to false');
    Fire.attr(MyCompBase, 'subVal', true);
    strictEqual(Fire.attr(MyCompBase, 'subVal'), true, 'attr should set to true');
});

test('dynamic attribute for instance', function () {
    var MyCompBase = function () {};
    var comp = new MyCompBase();

    Fire.attr(MyCompBase, 'subVal', false);
    Fire.attr(comp, 'subVal', true);
    strictEqual(Fire.attr(MyCompBase, 'subVal'), false, 'class attr should set to false');
    strictEqual(Fire.attr(comp, 'subVal'), true, 'instance attr should set to true');

    Fire.attr(MyCompBase, 'baseVal', 123);
    strictEqual(Fire.attr(comp, 'baseVal'), 123, 'instance attr should inherited from base');


    Fire.attr(MyCompBase, 'readonly', {a: false});
    Fire.attr(comp, 'readonly', {b: true});
    deepEqual(Fire.attr(comp, 'readonly'), {a: false, b: true}, 'object attrs should merged');

    Fire.attr(MyCompBase, 'readonly', {b: false});
    deepEqual(Fire.attr(comp, 'readonly'), {a: false, b: true}, 'instance attr should override base');

    Fire.attr(MyCompBase, 'readonly', {b: false});
    deepEqual(Fire.attr(MyCompBase, 'readonly'), {a: false, b: false}, 'class attrs should not changed');
});
