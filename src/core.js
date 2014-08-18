FIRE.extend = function (cls, base) {
    for (var p in base) if (base.hasOwnProperty(p)) cls[p] = base[p];
    function __() { this.constructor = cls; }
    __.prototype = base.prototype;
    cls.prototype = new __();
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
