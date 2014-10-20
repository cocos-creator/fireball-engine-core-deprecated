Fire.HashObject = (function () {
    
    /**
     * 提供获取对象ID的功能，该ID全局唯一但不会被序列化，可用于索引对象。
     * @class Fire.HashObject
     */
    var HashObject = Fire.define('Fire.HashObject', Fire.FObject, function () {
        FObject.call(this);

        Object.defineProperty(this, '_hashId', {
            value: 0,
            writable: true,
            enumerable: false
        });
        Object.defineProperty(this, '_hashKey', {
            value: '',
            writable: true,
            enumerable: false
        });
    });

    var id = 0;
    
    /**
     * @member {number} Fire.HashObject#hashId
     */
    Object.defineProperty ( HashObject.prototype, 'hashId', {
        get: function () {
            return this._hashId || (this._hashId = ++id);
        }
    });

    /**
     * @member {string} Fire.HashObject#hashKey
     */
    Object.defineProperty ( HashObject.prototype, 'hashKey', {
        get: function () {
            return this._hashKey || (this._hashKey = '' + this.hashId);
        }
    });

    return HashObject;
})();
