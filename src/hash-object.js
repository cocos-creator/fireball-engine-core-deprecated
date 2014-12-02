var HashObject = (function () {
    
    /**
     * 提供获取对象ID的功能，该ID全局唯一但不会被序列化，可用于索引对象。
     * 如果你将对象索引起来，必须记住清除索引，否则对象将永远不会被销毁。
     * @class Fire.HashObject
     */
    var HashObject = Fire.define('Fire.HashObject', Fire.FObject, function () {
        FObject.call(this);

        Object.defineProperty(this, '_hashCode', {
            value: 0,
            writable: true,
            enumerable: false
        });
        Object.defineProperty(this, '_id', {
            value: '',
            writable: true,
            enumerable: false
        });
    });

    // Yes, the id might have a conflict problem once every 365 days
    // if the game runs at 60 FPS and each frame 4760273 counts of new HashObject's id are requested.
    var globalId = 0;
    
    /**
     * @member {number} Fire.HashObject#hashCode
     */
    Object.defineProperty ( HashObject.prototype, 'hashCode', {
        get: function () {
            return this._hashCode || (this._hashCode = ++globalId);
        }
    });

    /**
     * @member {string} Fire.HashObject#id
     */
    Object.defineProperty ( HashObject.prototype, 'id', {
        get: function () {
            return this._id || (this._id = '' + this.hashCode);
        }
    });

    return HashObject;
})();

Fire.HashObject = HashObject;
