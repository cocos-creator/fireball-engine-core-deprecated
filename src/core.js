/**
 * @method FIRE.extend
 * @param {string} className
 * @param {function} cls
 * @param {function} base
 * @returns {function} the base class
 */
FIRE.extend = function (className, cls, base) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
    FIRE.setClassName(cls, className);
    return base;
};

/**
 * for test only
 * @method FIRE.simpleExtend
 * @private
 * @param {function} cls
 * @param {function} base
 * @param {string} className
 * @returns {function} new created class
 */
FIRE.simpleExtend = function (base, cls, className) {
    function realClass () {
        base.apply(this, arguments);
        if (cls) {
            cls.apply(this, arguments);
        }
    }
    FIRE.extend(className, realClass, base);
    return realClass;
};

FIRE.enum = function () {
    // TODO:
};
