// @ifndef PLAYER
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Fire;
        }
        exports.Fire = Fire;
    }
    else if (typeof define !== 'undefined' && define.amd) {
        define(Fire);
    }
    else {
        root.Fire = Fire;
    }
}).call(this);
// @endif
