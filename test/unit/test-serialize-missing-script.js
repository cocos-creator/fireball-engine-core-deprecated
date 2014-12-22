// jshint ignore: start

test('deserialize missing script', function() {

    var MissingScript = Fire.define('MissingScript').prop('_$erialized', null);
    MissingScript.safeFindClass = function (className) {
        return Fire.getClassByName(className) || MissingScript;
    };

    var ToMiss = Fire.define('ToMiss').prop('ref', null);

    var obj = new ToMiss();
    obj.ref = new Fire.FObject();

    var lastData = Fire.serialize(obj);
    delete obj.__id__;
    delete obj.ref.__id__;
    Fire.undefine(ToMiss);

    // deserialize

    var missed = Fire.deserialize(lastData, null, true, {classFinder: MissingScript.safeFindClass});

    var expectBackup = {
        "__type__": "ToMiss",
        "ref": obj.ref,
    };
    deepEqual(missed._$erialized, expectBackup, 'can deserialize missing script');

    // serialize

    reSerialized = Fire.serialize(missed, false, false);
    delete obj.ref.__id__;
    deepEqual(reSerialized, JSON.parse(lastData), 'can serialize missing script as its original data');

    //// re deserialize after fixed, no need to test ;)
    //Fire.registerClass('ToMiss', ToMiss);
    //var recovered = Fire.deserialize(reSerialized);
    //deepEqual(recovered, obj, 'can deserialize correctly after script fixed');
    //Fire.unregisterClass(ToMiss);
});

// jshint ignore: end
