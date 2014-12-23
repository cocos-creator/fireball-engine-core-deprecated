// @ifndef PLAYER
})(Fire);

if (typeof module !== "undefined" && module) {
    module.exports = Fire;
}
else if (typeof define === "function" && define && define.amd) {
    define([], function() {
        return Fire;
    });
}
// @endif
