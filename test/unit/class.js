largeModule('Class');

test('base', function () {
    var Animal = FIRE.define('Animal')
                     .prop('name', '...', FIRE.Type('Float'), FIRE.Serializable)
                     .prop('eat', function () {
                         return 'eating';
                     });
    strictEqual(FIRE.getClassName(Animal), 'Animal', 'get class name');

    Animal.prop('weight', -1, FIRE.NonSerialized);

    var instance = new Animal();
    strictEqual(instance.name, '...', 'get property');
    strictEqual(instance.eat(), 'eating', 'get chained property');
    strictEqual(instance.weight, -1, 'get partial property');

    strictEqual(FIRE.attr(Animal, 'name').type, 'Float', 'get name type');
    strictEqual(FIRE.attr(Animal, 'name').serializable, true, 'get name serializable');
    strictEqual(FIRE.attr(Animal, 'weight').serializable, false, 'get attribute');
});
/*
test('inherit', function () {
    var Animal = FIRE.define('Animal');
    var Dog = FIRE.derive('Dog', Animal);
    var Husky = FIRE.define('Husky', Dog);

    strictEqual(FIRE.getClassName(Husky), 'Husky', 'can get class name');
});
*/