module('dom');

test('dom test', function() {
    var foo = document.createElement('div');
    foo.id = 'foo';
    var bar1 = document.createElement('div');
    bar1.id = 'bar1';
    foo.appendChild(bar1);
    var bar2 = document.createElement('div');
    bar2.id = 'bar2';
    foo.appendChild(bar2);
    document.body.appendChild(foo);

    equal( FIRE.find(foo, document.getElementById('bar2')), true, "The value must be same" );
});

