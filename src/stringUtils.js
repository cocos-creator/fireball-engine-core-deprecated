FIRE.camelCaseToHuman = function ( text ) {
    var result = text.replace(/([A-Z])/g, ' $1');

    // remove first white-space
    if ( result.charAt(0) == ' ' ) {
        result.slice(1);
    }

    // capitalize the first letter
    return result.charAt(0).toUpperCase() + result.slice(1);
};
