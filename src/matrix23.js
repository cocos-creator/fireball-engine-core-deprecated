/**
 * Simple matrix to do 2D affine transformations.
 * It is actually 3x3 but the last row is [0 0 1].
 * @class Matrix23
 * @constructor
 */
var Matrix23 = function () {
    /**
     * @property a
     * @type {number}
     * @default 1
     */
    this.a = 1;

    /**
     * @property b
     * @type {number}
     * @default 0
     */
    this.b = 0;

    /**
     * @property c
     * @type {number}
     * @default 0
     */
    this.c = 0;

    /**
     * @property d
     * @type {number}
     * @default 1
     */
    this.d = 1;

    /**
     * @property tx
     * @type {number}
     * @default 0
     */
    this.tx = 0;

    /**
     * @property ty
     * @type {number}
     * @default 0
     */
    this.ty = 0;
};
JS.setClassName('Fire.Matrix23', Matrix23);
Fire.Matrix23 = Matrix23;

/**
 * @property identity
 * @type {Matrix23}
 * @static
 */
Matrix23.identity = new Matrix23();

/**
 * @method clone
 * @return {Matrix23}
 */
Matrix23.prototype.clone = function () {
    var mat = new Matrix23();
    mat.a = this.a;
    mat.b = this.b;
    mat.c = this.c;
    mat.d = this.d;
    mat.tx = this.tx;
    mat.ty = this.ty;
    return mat;
};

/**
 * @method clone
 * @param {Matrix23} other
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.set = function (other) {
    this.a = other.a;
    this.b = other.b;
    this.c = other.c;
    this.d = other.d;
    this.tx = other.tx;
    this.ty = other.ty;
    return this;
};

/**
 * @method equals
 * @param {Matrix23} other
 * @return {boolean}
 */
Matrix23.prototype.equals = function (other) {
    return other &&
           this.a === other.a &&
           this.b === other.b &&
           this.c === other.c &&
           this.d === other.d &&
           this.tx === other.tx &&
           this.ty === other.ty;
};

/**
 * @method toString
 * @return {string}
 */
Matrix23.prototype.toString = function () {
    return '|' + this.a.toFixed(2) + ' ' + this.c.toFixed(2) + ' ' + this.tx.toFixed(2) +
        '|\n|' + this.b.toFixed(2) + ' ' + this.d.toFixed(2) + ' ' + this.ty.toFixed(2) +
        '|\n|0.00 0.00 1.00|';
};

/**
 * Reset this matrix to identity.
 * @method identity
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.identity = function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
};

/**
 * Prepend this matrix.
 * @method prepend
 * @param {Matrix23} other
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.prepend = function (other) {
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
        var otx = this.tx;
        this.tx = otx * a + this.ty * c + other.tx;
        this.ty = otx * b + this.ty * d + other.ty;
    }
    else {
        this.tx += other.tx;
        this.ty += other.ty;
    }
    return this;
};

/**
 * Invert this matrix.
 * @method invert
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.invert = function () {
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

/**
 * Apply transforms to given vector
 * @method transformPoint
 * @param {Vec2} vector
 * @param {Vec2} [out] - optional, the receiving vector
 * @return {Vec2} the result
 */
Matrix23.prototype.transformPoint = function (vector, out) {
    out = out || new Vec2();
    var x = vector.x;   // vector may === out
    out.x = this.a * x + this.c * vector.y + this.tx;
    out.y = this.b * x + this.d * vector.y + this.ty;
    return out;
};

//Matrix23.prototype.transformPointXY = function (x, y, out) {
//    out = out || new Vec2();
//    out.x = this.a * x + this.c * y + this.tx;
//    out.y = this.b * x + this.d * y + this.ty;
//    return out;
//};

/**
 * Get scaling of this matrix.
 *
 * NOTE: negative scaling (mirroring) is not supported
 * @method getScale
 * @param {Vec2} [out] - optional, the receiving vector
 * @return {Vec2} the result
 */
Matrix23.prototype.getScale = function (out) {
    out = out || new Vec2();
    out.x = Math.sqrt(this.a * this.a + this.b * this.b);
    out.y = Math.sqrt(this.c * this.c + this.d * this.d);
    return out;
};

/**
 * Extract translation, rotation and scaling component from this matrix.
 * Only support negative(mirroring) scaling in some special case.
 *
 * @method getTRS
 * @return {object} {translation: Vec2, rotation: number, scale: Vec2}
 */
Matrix23.prototype.getTRS = function () {
    var r = 0;
    var s = this.getScale();
    var mirrored = this.a !== 0 && this.a === -this.d && this.b === 0 && this.c === 0;
    if (mirrored) {
        if (this.a < 0) {
            s.x = -s.x;
        }
        else {
            s.y = -s.y;
        }
    }
    else {
        r = this.getRotation();
    }
    return {
        translation: new Fire.Vec2(this.tx, this.ty),
        rotation: r,
        scale: s
    };
};

/**
 * Set scaling of this matrix.
 *
 * NOTE: Can not scale negative scaling (mirroring) and zero scaling matrix.
 * @method setScale
 * @param {Vec2} scale
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.setScale = function (scale) {
    var s = this.getScale();
    var x = scale.x / s.x;
    var y = scale.y / s.y;
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
};

/**
 * Get rotation of this matrix.
 * @method getRotation
 * @return {number}
 */
Matrix23.prototype.getRotation = function () {
    var hasSkew = this.b / this.a !== -this.c / this.d;
    if ( !hasSkew ) {
        return Math.atan2(-this.c, this.d);
    }
    else {
        return (Math.atan2(this.b, this.a) + Math.atan2(-this.c, this.d)) * 0.5;
    }
};

/**
 * Get translation of this matrix.
 * @method getTranslation
 * @return {Vec2}
 */
Matrix23.prototype.getTranslation = function (out) {
    out = out || new Vec2();
    out.x = this.tx;
    out.y = this.ty;
    return out;
};

/**
 * Rotate this matrix by counterclockwise.
 * @method rotate
 * @param {number} radians
 * @return {Matrix23}
 * @chainable
 */
Matrix23.prototype.rotate = function (radians) {
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    var a = this.a;
    var b = this.b;
    this.a = (a * cos + this.c * sin);
    this.b = (b * cos + this.d * sin);
    this.c = (this.c * cos - a * sin);
    this.d = (this.d * cos - b * sin);
    return this;
};

/*
Matrix23.prototype.translate = function (x, y) {
    this.tx += x;
    this.ty += y;
};

Matrix23.prototype.scale = function (x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
};
*/
