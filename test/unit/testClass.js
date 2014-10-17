largeModule('Class');

test('test', function () {
    var Animal = Fire.define('Animal')
                     .prop('name', '...', { type: 'Float' }, { serializable: true })
                     .prop('eat', function () {
                         return 'eating';
                     });
    strictEqual(Fire.getClassName(Animal), 'Animal', 'get class name');

    Animal.prop('weight', -1, Fire.NonSerialized);
    Animal.set('weight10', function (value) {
        this.weight = Math.floor(value / 10);
    });
    Animal.get('weight10', function () {
        return this.weight * 10;
    }, Fire.Integer);
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

    strictEqual(Fire.attr(Animal, 'name').type, 'Float', 'get name type');
    strictEqual(Fire.attr(Animal, 'name').serializable, true, 'get name serializable');
    strictEqual(Fire.attr(Animal, 'weight').serializable, false, 'get attribute');

    // getter / setter

    strictEqual(instance.weight10, instance.weight * 10, 'define getter');
    instance.weight10 = 40;
    strictEqual(instance.weight10, 40, 'define setter');

    strictEqual(instance.weight5x, instance.weight * 5, 'define getter by getset');
    instance.weight5x = 30;
    strictEqual(instance.weight5x, 30, 'define setter by getset');

    // constructor

    Fire.undefine(Animal);

    var constructor = new Callback();
    Animal = Fire.define('Animal', constructor)
                 .prop('weight', 100);

    constructor.enable();
    var instance1 = new Animal();
    constructor.once('call constructor');

    strictEqual(Fire.attr(Animal, 'weight').default, 100, 'can get attribute even has constructor');
    strictEqual(instance1.weight, 100, 'property inited even has constructor');

    var instance2 = new Animal();
    instance1.weight = 0;
    strictEqual(instance2.weight, 100, 'is instance property');

    var instance3 = new Animal();
    strictEqual(instance3.weight, 100, 'class define not changed');

    Fire.undefine(Animal);
});

test('Inherit', function () {
    var Animal = Fire.define('Fire.Animal').prop('name', 'ann');
    var Dog = Fire.define('Fire.Dog', Animal)
                   .prop('name', 'doge', { type: 'str' });
    var Husky = Fire.define('Fire.Husky', Dog).prop('weight', 100);

    strictEqual(Fire.getClassName(Animal), 'Fire.Animal', 'can get class name 1');
    strictEqual(Fire.getClassName(Dog), 'Fire.Dog', 'can get class name 2');
    strictEqual(Fire.getClassName(Husky), 'Fire.Husky', 'can get class name 3');
    
    strictEqual(Dog.$super, Animal, 'can get super');

    strictEqual(Fire.attr(Animal, 'name'), Fire.attr(Dog, 'name'), 
                "inheritance chain shares the same property's attribute");
    strictEqual(Fire.attr(Dog, 'name').type, 'str', 'can modify attribute');
    strictEqual(Fire.attr(Dog, 'weight'), undefined, 'base property not added');

    strictEqual(Fire.superof( Animal, Dog),  true, 'Animal is super of Dog');
    strictEqual(Fire.superof( Animal, Husky),  true, 'Animal is super of Husky');
    strictEqual(Fire.superof( Dog, Husky),  true, 'Dog is super of Husky');

    strictEqual(Fire.childof( Dog, Animal),  true, 'Animal is child of Dog');
    strictEqual(Fire.childof( Husky, Animal),  true, 'Animal is child of Husky');
    strictEqual(Fire.childof( Dog, Husky),  false, 'Dog is not child of Husky');

    var husky = new Husky();
    var dog = new Dog();
    
    strictEqual(dog.name, 'doge', 'can override property');
    strictEqual(husky.name, 'doge', 'can inherit property');

    deepEqual(Husky.__props__, ['name', 'weight'], 'can inherit prop list');
    deepEqual(Dog.__props__, ['name'], 'base prop list not changed');

    Fire.undefine(Animal, Dog, Husky);
});

test('Inherit + constructor', function () {
    var animalConstructor = Callback();
    var huskyConstructor = Callback();
    var Animal = Fire.define('Fire.Animal', animalConstructor)
                      .prop('name', 'ann');
    var Dog = Fire.define('Fire.Dog', Animal)
                  .prop('name', 'doge');
    var Husky = Fire.define('Fire.Husky', Dog, huskyConstructor);

    strictEqual(Fire.getClassName(Dog), 'Fire.Dog', 'can get class name 2');

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

    Fire.undefine(Animal, Dog, Husky);
});

test('prop reference', function () {
    var type = Fire.define('Fire.MyType')
                   .prop('ary', [])
                   .prop('vec2', new Fire.Vec2(10, 20))
                   .prop('dict', {});
    var obj1 = new type();
    var obj2 = new type();

    notStrictEqual(obj1.vec2, obj2.vec2, 'cloneable object reference not equal');
    notStrictEqual(obj1.ary, obj2.ary, 'empty array reference not equal');
    notStrictEqual(obj1.dict, obj2.dict, 'empty dict reference not equal');

    Fire.undefine(type);
});
