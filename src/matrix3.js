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
