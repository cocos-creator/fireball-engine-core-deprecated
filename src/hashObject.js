﻿FIRE.HashObject = (function () {
    
    /**
     * 提供获取对象ID的功能，该ID全局唯一但不会被序列化，可用于索引对象。
     * @class FIRE.HashObject
     */
    var HashObject = FIRE.define('FIRE.HashObject', FIRE.FObject, function () {
        FObject.call(this);

        this._hashID = 0;
        this._hashKey = '';
    });

    var id = 0;
    
    /**
     * @member {string} FIRE.HashObject#hashID
     */
    Object.defineProperty ( HashObject.prototype, 'hashID', {
        get: function () {
            return this._hashID || (this._hashID = ++id);
        }
    });

    /**
     * @member {string} FIRE.HashObject#hashKey
     */
    Object.defineProperty ( HashObject.prototype, 'hashKey', {
        get: function () {
            return this._hashKey || (this._hashKey = '' + this.hashID);
        }
    });

    return HashObject;
})();