var Matrix3 = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
};
FIRE.registerClass('FIRE.Matrix3', Matrix3);
FIRE.Matrix3 = Matrix3;

Matrix3.identity = new Matrix3();

Matrix3.prototype.clone = function () {
    var mat = new Matrix3();
    mat.a = this.a;
    mat.b = this.b;
    mat.c = this.c;
    mat.d = this.d;
    mat.tx = this.tx;
    mat.ty = this.ty;
    return mat;
};

Matrix3.prototype.toString = function () {
    return '|' + this.a.toFixed(2) + ' ' + this.b.toFixed(2) + ' ' + this.tx.toFixed(2) + 
        '|\n|' + this.c.toFixed(2) + ' ' + this.d.toFixed(2) + ' ' + this.ty.toFixed(2) + 
        '|\n|0.00 0.00 1.00|';
};

Matrix3.prototype.identity = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

Matrix3.prototype.prepend = function (other) {
    var a = other.a;
    var b = other.b;
    var c = other.c;
    var d = other.d;
    if (a !== 1 || b !== 0 || c !== 0 || d !== 1) {
        var oa = this.a;
        var oc = this.c;
        this.a = oa * a + this.b * c;
        this.b = oa * b + this.b * d;
        this.c = oc * a + this.d * c;
        this.d = oc * b + this.d * d;
    }
    var otx = this.tx;
    this.tx = otx * a + this.ty * c + other.tx;
    this.ty = otx * b + this.ty * d + other.ty;
    return this;
};

Matrix3.prototype.invert = function () {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var tx = this.tx;
    var determinant = 1 / (a * d - b * c);
    this.a = d * determinant;
    this.b = -b * determinant;
    this.c = -c * determinant;
    this.d = a * determinant;
    this.tx = (c * this.ty - d * tx) * determinant;
    this.ty = (b * tx - a * this.ty) * determinant;
    return this;
};

Matrix3.prototype.transformPoint = function (vector, out) {
    out = out || new Vec2();
    out.x = this.a * vector.x + this.c * vector.y + this.tx;
    out.y = this.b * vector.x + this.d * vector.y + this.ty;
    return out;
};

// negative scaling (mirroring) is not supported
Matrix3.prototype.getScale = function (out) {
    out = out || new Vec2();
    out.x = Math.sqrt(this.a * this.a + this.b * this.b);
    out.y = Math.sqrt(this.c * this.c + this.d * this.d);
    return out;
};

Matrix3.prototype.setScale = function (x, y) {
    var s = this.getScale();
    x /= s.x;
    y /= s.y;
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
};

/*Matrix3.prototype.scale = function (x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
};*/