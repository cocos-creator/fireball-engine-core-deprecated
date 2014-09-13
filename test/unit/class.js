largeModule('Class');

test('test', function () {
    var Animal = FIRE.define('Animal')
                     .prop('name', '...', { type: 'Float' }, { serializable: true })
                     .prop('eat', function () {
                         return 'eating';
                     });
    strictEqual(FIRE.getClassName(Animal), 'Animal', 'get class name');

    Animal.prop('weight', -1, FIRE.NonSerialized);
    Animal.set('weight10', function (value) {
        this.weight = Math.floor(value / 10);
    });
    Animal.get('weight10', function () {
        return this.weight * 10;
    }, FIRE.Integer);
    Animal.getset('weight5x',
        function () {
            return this.weight * 5;
        },
        function (value) {
            this.weight = value / 5;
        }
    );

    // property

    var instance = new Animal();
    strictEqual(instance.name, '...', 'get property');
    strictEqual(instance.eat(), 'eating', 'get chained property');
    strictEqual(instance.weight, -1, 'get partial property');

    strictEqual(FIRE.attr(Animal, 'name').type, 'Float', 'get name type');
    strictEqual(FIRE.attr(Animal, 'name').serializable, true, 'get name serializable');
    strictEqual(FIRE.attr(Animal, 'weight').serializable, false, 'get attribute');

    // getter / setter

    strictEqual(instance.weight10, instance.weight * 10, 'define getter');
    instance.weight10 = 40;
    strictEqual(instance.weight10, 40, 'define setter');

    strictEqual(instance.weight5x, instance.weight * 5, 'define getter by getset');
    instance.weight5x = 30;
    strictEqual(instance.weight5x, 30, 'define setter by getset');

    // constructor

    FIRE.undefine(Animal);

    var constructor = new callback();
    Animal = FIRE.define('Animal', constructor)
                 .prop('weight', 100);

    constructor.enable();
    var instance1 = new Animal();
    constructor.once('call constructor');

    strictEqual(FIRE.attr(Animal, 'weight').default, 100, 'can get attribute even has constructor');
    strictEqual(instance1.weight, 100, 'property inited even has constructor');

    var instance2 = new Animal();
    instance1.weight = 0;
    strictEqual(instance2.weight, 100, 'is instance property');

    var instance3 = new Animal();
    strictEqual(instance3.weight, 100, 'class define not changed');

    FIRE.undefine(Animal);
});

test('Inherit', function () {
    var Animal = FIRE.define('FIRE.Animal').prop('name', 'ann');
    var Dog = FIRE.define('FIRE.Dog', Animal)
                   .prop('name', 'doge', { type: 'str' });
    var Husky = FIRE.define('FIRE.Husky', Dog).prop('weight', 100);

    strictEqual(FIRE.getClassName(Animal), 'FIRE.Animal', 'can get class name 1');
    strictEqual(FIRE.getClassName(Dog), 'FIRE.Dog', 'can get class name 2');
    strictEqual(FIRE.getClassName(Husky), 'FIRE.Husky', 'can get class name 3');
    
    strictEqual(Dog.$super, Animal, 'can get super');

    strictEqual(FIRE.attr(Animal, 'name'), FIRE.attr(Dog, 'name'), 
                "inheritance chain shares the same property's attribute");
    strictEqual(FIRE.attr(Dog, 'name').type, 'str', 'can modify attribute');
    strictEqual(FIRE.attr(Dog, 'weight'), undefined, 'base property not added');

    strictEqual(FIRE.superof( Animal, Dog),  true, 'Animal is super of Dog');
    strictEqual(FIRE.superof( Animal, Husky),  true, 'Animal is super of Husky');
    strictEqual(FIRE.superof( Dog, Husky),  true, 'Dog is super of Husky');

    strictEqual(FIRE.childof( Dog, Animal),  true, 'Animal is child of Dog');
    strictEqual(FIRE.childof( Husky, Animal),  true, 'Animal is child of Husky');
    strictEqual(FIRE.childof( Dog, Husky),  false, 'Dog is not child of Husky');

    var husky = new Husky();
    var dog = new Dog();
    
    strictEqual(dog.name, 'doge', 'can override property');
    strictEqual(husky.name, 'doge', 'can inherit property');

    deepEqual(Husky.__props__, ['name', 'weight'], 'can inherit prop list');
    deepEqual(Dog.__props__, ['name'], 'base prop list not changed');

    FIRE.undefine(Animal, Dog, Husky);
});

test('Inherit + constructor', function () {
    var animalConstructor = callback();
    var huskyConstructor = callback();
    var Animal = FIRE.define('FIRE.Animal', animalConstructor)
                      .prop('name', 'ann');
    var Dog = FIRE.define('FIRE.Dog', Animal)
                  .prop('name', 'doge');
    var Husky = FIRE.define('FIRE.Husky', Dog, huskyConstructor);

    strictEqual(FIRE.getClassName(Dog), 'FIRE.Dog', 'can get class name 2');

    animalConstructor.disable('base construct should called by sub construct');
    huskyConstructor.enable();
    huskyConstructor.callbackFunction(function () {
        animalConstructor.enable();
        Husky.$super.call(this);
    });
    var husky = new Husky();
    huskyConstructor.once('call husky constructor');
    animalConstructor.once('call anim constructor by husky');

    var dog = new Dog();
    animalConstructor.once('call anim constructor by dog');

    strictEqual(dog.name, 'doge', 'can override property');
    strictEqual(husky.name, 'doge', 'can inherit property');

    FIRE.undefine(Animal, Dog, Husky);
});

test('Inherit from native class', 0, function () {
    // TODO
});

test('Inherit by FIRE.extend', 0, function () {
    // TODO
});
