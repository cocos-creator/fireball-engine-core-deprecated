Vec2 = (function () {

    function Vec2( x, y ) {
        this.x = (typeof x === 'number' ? x : 0.0);
        this.y = (typeof y === 'number' ? y : 0.0);
    }
    Fire.registerClass('Fire.Vec2', Vec2);

    // static

    Object.defineProperty(Vec2, 'one', {
        get: function () {
            return new Vec2(1.0, 1.0);
        }
    });

    Object.defineProperty(Vec2, 'zero', {
        get: function () {
            return new Vec2(0.0, 0.0);
        }
    });

    // member

    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };

    Vec2.prototype.set = function ( newValue ) {
        this.x = newValue.x;
        this.y = newValue.y;
    };

    Vec2.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };

    Vec2.prototype.toString = function () {
        return "(" +
            this.x.toFixed(2) + ", " +
            this.y.toFixed(2) + ")"
        ;
    };

    /**
     * Adds this vector. If you want to save result to another vector, use add() instead.
     * @method Fire.Vec2#addSelf
     * @param {Fire.Vec2} vector
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.addSelf = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };

    /**
     * Adds tow vectors, and returns the new result.
     * @method Fire.Vec2#add
     * @param {Fire.Vec2} vector
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.add = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x + vector.x;
        out.y = this.y + vector.y;
        return out;
    };

    /**
     * Subtracts one vector from this. If you want to save result to another vector, use sub() instead.
     * @method Fire.Vec2#subSelf
     * @param {Fire.Vec2} vector
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.subSelf = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };

    /**
     * Subtracts one vector from this, and returns the new result.
     * @method Fire.Vec2#sub
     * @param {Fire.Vec2} vector
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.sub = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        return out;
    };

    /**
     * Multiplies this by a number. If you want to save result to another vector, use mul() instead.
     * @method Fire.Vec2#mulSelf
     * @param {number} num
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.mulSelf = function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    };

    /**
     * Multiplies by a number, and returns the new result.
     * @method Fire.Vec2#mul
     * @param {number} num
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.mul = function (num, out) {
        out = out || new Vec2();
        out.x = this.x * num;
        out.y = this.y * num;
        return out;
    };

    /**
     * Multiplies two vectors.
     * @method Fire.Vec2#scaleSelf
     * @param {Fire.Vec2} vector
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.scaleSelf = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    };

    /**
     * Multiplies two vectors, and returns the new result.
     * @method Fire.Vec2#scale
     * @param {Fire.Vec2} vector
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.scale = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x * vector.x;
        out.y = this.y * vector.y;
        return out;
    };

    /**
     * Divides two vectors. If you want to save result to another vector, use div() instead.
     * @method Fire.Vec2#divSelf
     * @param {Fire.Vec2} vector
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.divSelf = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    };

    /**
     * Divides two vectors, and returns the new result.
     * @method Fire.Vec2#div
     * @param {Fire.Vec2} vector
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.div = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x / vector.x;
        out.y = this.y / vector.y;
        return out;
    };

    /**
     * Negates the components. If you want to save result to another vector, use neg() instead.
     * @method Fire.Vec2#negSelf
     * @returns {Fire.Vec2} returns this
     */
    Vec2.prototype.negSelf = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * Negates the components, and returns the new result.
     * @method Fire.Vec2#neg
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.neg = function (out) {
        out = out || new Vec2();
        out.x = -this.x;
        out.y = -this.y;
        return out;
    };

    /**
     * Dot product
     * @method Fire.Vec2#dot
     * @param {Fire.Vec2} [vector]
     * @returns {number} the result
     */
    Vec2.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    /**
     * Cross product
     * @method Fire.Vec2#cross
     * @param {Fire.Vec2} [vector]
     * @returns {number} the result
     */
    Vec2.prototype.cross = function (vector) {
        return this.y * vector.x - this.x * vector.y;
    };

    /**
     * Magnitude
     * @method Fire.Vec2#mag
     * @returns {number} the result
     */
    Vec2.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    /**
     * Magnitude Sqaure
     * @method Fire.Vec2#magSqr
     * @returns {number} the result
     */
    Vec2.prototype.magSqr = function () {
        return this.x * this.x + this.y * this.y;
    };

    /**
     * Normalize self
     * @method Fire.Vec2#normalizeSelf
     * @returns {Fire.Vec2} this
     */
    Vec2.prototype.normalizeSelf = function () {
        var magSqr = this.x * this.x + this.y * this.y;
        if ( magSqr === 1.0 )
            return this;

        if ( magSqr === 0.0 ) {
            console.warn( "Can't normalize zero vector" );
            return this;
        }

        var invsqrt = 1.0 / Math.sqrt(magSqr);
        this.x *= invsqrt;
        this.y *= invsqrt;

        return this;
    };

    /**
     * Get normalized vector
     * @method Fire.Vec2#normalize
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} result
     */
    Vec2.prototype.normalize = function (out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        out.normalizeSelf();
        return out;
    };

    /**
     * Get angle between this and vector
     * @method Fire.Vec2#angle
     * @param {Fire.Vec2} vector
     * @returns {number} from 0 to Math.PI
     */
    Vec2.prototype.angle = function (vector) {
        var magSqr1 = this.magSqr();
        var magSqr2 = vector.magSqr();

        if ( magSqr1 === 0 || magSqr2 === 0 ) {
            console.warn( "Can't get angle between zero vector" );
            return 0.0;
        }

        var dot = this.dot(vector);
        var theta = dot / (Math.sqrt(magSqr1 * magSqr2));
        theta = Math.clamp( theta, -1.0, 1.0 );
        return Math.acos(theta);
    };

    /**
     * Get angle between this and vector with direction
     * @method Fire.Vec2#signAngle
     * @param {Fire.Vec2} vector
     * @returns {number} from -MathPI to Math.PI
     */
    Vec2.prototype.signAngle = function (vector) {
        // NOTE: this algorithm will return 0.0 without signed if vectors are parallex
        // var angle = this.angle(vector);
        // var cross = this.cross(vector);
        // return Math.sign(cross) * angle;

        return Math.atan2( this.y, this.x ) - Math.atan2( vector.y, vector.x );
    };

    /**
     * rotate
     * @method Fire.Vec2#rotate
     * @param {number} radians
     * @param {Fire.Vec2} [out] - optional, the receiving vector
     * @returns {Fire.Vec2} the result
     */
    Vec2.prototype.rotate = function (radians, out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        return out.rotateSelf(radians);
    };

    /**
     * rotate self
     * @method Fire.Vec2#rotateSelf
     * @param {number} radians
     * @returns {Fire.Vec2} this
     */
    Vec2.prototype.rotateSelf = function (radians) {
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        var x = this.x;
        this.x = cos * x - sin * this.y;
        this.y = sin * x + cos * this.y;
        return this;
    };

    return Vec2;
})();

Fire.Vec2 = Vec2;

/**
 * The convenience method to create a new Vec2
 * @property {function} Fire.v2
 * @param {number|number[]} [x=0]
 * @param {number} [y=0]
 * @returns {Fire.Vec2}
 * @see Fire.Vec2
 */
Fire.v2 = function v2 (x, y) {
    if (Array.isArray(x)) {
        return new Vec2(x[0], x[1]);
    }
    else {
        return new Vec2(x, y);
    }
};
