/**
 * @method FIRE.extend
 * @param {function} cls
 * @param {function} base
 * @param {string} [className]
 */
FIRE.extend = function (cls, base, className) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
    if (className) {
        FIRE.setClassName(cls, className);
    }
    return cls;
};

// for test only
FIRE.simpleExtend = function (base, cls_opt, className_opt) {
    function realClass () {
        base.apply(this, arguments);
        if (cls_opt) {
            cls_opt.apply(this, arguments);
        }
    }
    FIRE.extend(realClass, base);
    if (className_opt) {
        realClass.prototype.__classname__ = className_opt;
    }
    return realClass;
};

FIRE.enum = function () {
    // TODO:
};
