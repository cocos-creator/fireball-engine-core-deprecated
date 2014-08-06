})(FIRE || (FIRE = {}));

if (typeof module !== "undefined" && module) {
    module.exports = FIRE;
}
else if (typeof define === "function" && define && define.amd) {
    define([], function() {
        return FIRE;
    });
}