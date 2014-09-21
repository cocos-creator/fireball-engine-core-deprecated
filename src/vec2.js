Vec2 = (function () {

    function Vec2( x, y ) {
        this.x = (typeof x === 'number' ? x : 0.0);
        this.y = (typeof y === 'number' ? y : 0.0);
    }
    FIRE.registerClass('FIRE.Vec2', Vec2);

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
     * @method FIRE.Vec2#addSelf
     * @param {FIRE.Vec2} vector
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.addSelf = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };

    /**
     * Adds tow vectors, and returns the new result.
     * @method FIRE.Vec2#add
     * @param {FIRE.Vec2} vector
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.add = function (vector, out) {
        out = out || new FIRE.Vec2();
        out.x = this.x + vector.x;
        out.y = this.y + vector.y;
        return out;
    };

    /**
     * Subtracts one vector from this. If you want to save result to another vector, use sub() instead.
     * @method FIRE.Vec2#subSelf
     * @param {FIRE.Vec2} vector
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.subSelf = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };

    /**
     * Subtracts one vector from this, and returns the new result.
     * @method FIRE.Vec2#sub
     * @param {FIRE.Vec2} vector
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.sub = function (vector, out) {
        out = out || new FIRE.Vec2();
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        return out;
    };

    /**
     * Multiplies this by a number. If you want to save result to another vector, use mul() instead.
     * @method FIRE.Vec2#mulSelf
     * @param {number} num
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.mulSelf = function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    };

    /**
     * Multiplies by a number, and returns the new result.
     * @method FIRE.Vec2#mul
     * @param {number} num
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.mul = function (num, out) {
        out = out || new FIRE.Vec2();
        out.x = this.x * num;
        out.y = this.y * num;
        return out;
    };

    /**
     * Multiplies two vectors.
     * @method FIRE.Vec2#scaleSelf
     * @param {FIRE.Vec2} vector
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.scaleSelf = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    };

    /**
     * Multiplies two vectors, and returns the new result.
     * @method FIRE.Vec2#scale
     * @param {FIRE.Vec2} vector
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.scale = function (vector, out) {
        out = out || new FIRE.Vec2();
        out.x = this.x * vector.x;
        out.y = this.y * vector.y;
        return out;
    };
    
    /**
     * Divides two vectors. If you want to save result to another vector, use div() instead.
     * @method FIRE.Vec2#divSelf
     * @param {FIRE.Vec2} vector
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.divSelf = function (vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    };

    /**
     * Divides two vectors, and returns the new result.
     * @method FIRE.Vec2#div
     * @param {FIRE.Vec2} vector
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.div = function (vector, out) {
        out = out || new FIRE.Vec2();
        out.x = this.x / vector.x;
        out.y = this.y / vector.y;
        return out;
    };

    /**
     * Negates the components. If you want to save result to another vector, use neg() instead.
     * @method FIRE.Vec2#negSelf
     * @returns {FIRE.Vec2} returns this
     */
    Vec2.prototype.negSelf = function () {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    };

    /**
     * Negates the components, and returns the new result.
     * @method FIRE.Vec2#neg
     * @param {FIRE.Vec2} [out] - optional, the receiving vector
     * @returns {FIRE.Vec2} the result
     */
    Vec2.prototype.neg = function (out) {
        out = out || new FIRE.Vec2();
        out.x = -this.x;
        out.y = -this.y;
        return out;
    };
    
    return Vec2;
})();

FIRE.Vec2 = Vec2;
