Vec2 = (function () {

    /**
     * Representation of 2D vectors and points.
     * - see {% crosslink Fire.v2 Fire.v2 %}
     * @class Vec2
     * @constructor
     * @param {number} [x=0]
     * @param {number} [y=0]
     */
    function Vec2( x, y ) {
        this.x = (typeof x === 'number' ? x : 0.0);
        this.y = (typeof y === 'number' ? y : 0.0);
    }
    JS.setClassName('Fire.Vec2', Vec2);

    // static

    /**
     * return a Vec2 object with x = 1 and y = 1
     * @property one
     * @type Vec2
     * @static
     */
    Object.defineProperty(Vec2, 'one', {
        get: function () {
            return new Vec2(1.0, 1.0);
        }
    });

    /**
     * return a Vec2 object with x = 0 and y = 0
     * @property zero
     * @type Vec2
     * @static
     */
    Object.defineProperty(Vec2, 'zero', {
        get: function () {
            return new Vec2(0.0, 0.0);
        }
    });

    /**
     * return a Vec2 object with x = 0 and y = 1
     * @property up
     * @type Vec2
     * @static
     */
    Object.defineProperty(Vec2, 'up', {
        get: function () {
            return new Vec2(0.0, 1.0);
        }
    });

    /**
     * return a Vec2 object with x = 1 and y = 0
     * @property right
     * @type Vec2
     * @static
     */
    Object.defineProperty(Vec2, 'right', {
        get: function () {
            return new Vec2(1.0, 0.0);
        }
    });

    // member

    /**
     * @method clone
     * @return {Vec2}
     */
    Vec2.prototype.clone = function () {
        return new Vec2(this.x, this.y);
    };

    /**
     * @method set
     * @param {Vec2} newValue
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.set = function ( newValue ) {
        this.x = newValue.x;
        this.y = newValue.y;
        return this;
    };

    /**
     * @method equals
     * @param {Vec2} other
     * @return {boolean}
     */
    Vec2.prototype.equals = function (other) {
        if ( other && other instanceof Vec2 )
            return this.x === other.x && this.y === other.y;
        return false;
    };

    /**
     * @method toString
     * @return {string}
     */
    Vec2.prototype.toString = function () {
        return "(" +
            this.x.toFixed(2) + ", " +
            this.y.toFixed(2) + ")"
        ;
    };

    /**
     * Adds this vector. If you want to save result to another vector, use add() instead.
     * @method addSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.addSelf = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };

    /**
     * Adds tow vectors, and returns the new result.
     * @method add
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.add = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x + vector.x;
        out.y = this.y + vector.y;
        return out;
    };

    /**
     * Subtracts one vector from this. If you want to save result to another vector, use sub() instead.
     * @method subSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.subSelf = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };

    /**
     * Subtracts one vector from this, and returns the new result.
     * @method sub
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.sub = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        return out;
    };

    /**
     * Multiplies this by a number. If you want to save result to another vector, use mul() instead.
     * @method mulSelf
     * @param {number} num
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.mulSelf = function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    };

    /**
     * Multiplies by a number, and returns the new result.
     * @method mul
     * @param {number} num
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.mul = function (num, out) {
        out = out || new Vec2();
        out.x = this.x * num;
        out.y = this.y * num;
        return out;
    };

    /**
     * Multiplies two vectors.
     * @method scaleSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.scaleSelf = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    };

    /**
     * Multiplies two vectors, and returns the new result.
     * @method scale
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.scale = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x * vector.x;
        out.y = this.y * vector.y;
        return out;
    };

    /**
     * Divides two vectors. If you want to save result to another vector, use div() instead.
     * @method divSelf
     * @param {Vec2} vector
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.divSelf = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    };

    /**
     * Divides two vectors, and returns the new result.
     * @method div
     * @param {Vec2} vector
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.div = function (vector, out) {
        out = out || new Vec2();
        out.x = this.x / vector.x;
        out.y = this.y / vector.y;
        return out;
    };

    /**
     * Negates the components. If you want to save result to another vector, use neg() instead.
     * @method negSelf
     * @return {Vec2} returns this
     * @chainable
     */
    Vec2.prototype.negSelf = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * Negates the components, and returns the new result.
     * @method neg
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.neg = function (out) {
        out = out || new Vec2();
        out.x = -this.x;
        out.y = -this.y;
        return out;
    };

    /**
     * Dot product
     * @method dot
     * @param {Vec2} [vector]
     * @return {number} the result
     */
    Vec2.prototype.dot = function (vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    /**
     * Cross product
     * @method cross
     * @param {Vec2} [vector]
     * @return {number} the result
     */
    Vec2.prototype.cross = function (vector) {
        return this.y * vector.x - this.x * vector.y;
    };

    /**
     * Returns the length of this vector.
     * @method mag
     * @return {number} the result
     */
    Vec2.prototype.mag = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    /**
     * Returns the squared length of this vector.
     * @method magSqr
     * @return {number} the result
     */
    Vec2.prototype.magSqr = function () {
        return this.x * this.x + this.y * this.y;
    };

    /**
     * Make the length of this vector to 1.
     * @method normalizeSelf
     * @return {Vec2} returns this
     * @chainable
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
     * Returns this vector with a magnitude of 1.
     * - Note that the current vector is unchanged and a new normalized vector is returned. If you want to normalize the current vector, use normalizeSelf function.
     * @method normalize
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} result
     */
    Vec2.prototype.normalize = function (out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        out.normalizeSelf();
        return out;
    };

    /**
     * Get angle in radian between this and vector
     * @method angle
     * @param {Vec2} vector
     * @return {number} from 0 to Math.PI
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
     * Get angle in radian between this and vector with direction
     * @method signAngle
     * @param {Vec2} vector
     * @return {number} from -MathPI to Math.PI
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
     * @method rotate
     * @param {number} radians
     * @param {Vec2} [out] - optional, the receiving vector
     * @return {Vec2} the result
     */
    Vec2.prototype.rotate = function (radians, out) {
        out = out || new Vec2();
        out.x = this.x;
        out.y = this.y;
        return out.rotateSelf(radians);
    };

    /**
     * rotate self
     * @method rotateSelf
     * @param {number} radians
     * @return {Vec2} returns this
     * @chainable
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
 * @class Fire
 */
/**
 * The convenience method to create a new {% crosslink Vec2 Vec2 %}
 * @method v2
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @return {Vec2}
 */
Fire.v2 = function v2 (x, y) {
    if (Array.isArray(x)) {
        return new Vec2(x[0], x[1]);
    }
    else {
        return new Vec2(x, y);
    }
};
