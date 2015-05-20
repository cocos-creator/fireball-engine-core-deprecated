var HashObject = (function () {

    /**
     * !#en Provides object id, this id is unique globally.
     * !#zh 提供获取对象ID的功能，该ID全局唯一但不会被序列化，可用于索引对象。
     *
     * 如果你将对象索引起来，必须记住清除索引，否则对象将永远不会被销毁。
     * @class HashObject
     * @extends FObject
     * @constructor
     */
    var HashObject = Fire.Class({

        name: 'Fire.HashObject',

        extends: Fire.FObject,

        constructor: function () {
            /**
             * @property _hashCode
             * @type number
             * @private
             */
            Object.defineProperty(this, '_hashCode', {
                value: 0,
                writable: true,
                enumerable: false
            });
            /**
             * @property _id
             * @type string
             * @private
             */
            Object.defineProperty(this, '_id', {
                value: '',
                writable: true,
                enumerable: false
            });
        }
    });

    return HashObject;
})();

// Yes, the id might have a conflict problem once every 365 days
// if the game runs at 60 FPS and each frame 4760273 counts of new HashObject's id are requested.
var globalId = 0;

/**
 * @property hashCode
 * @type number
 * @readOnly
 */
JS.get ( HashObject.prototype, 'hashCode', function () {
    return this._hashCode || (this._hashCode = ++globalId);
});

/**
 * !#en the universal unique id
 * !#zh 全局唯一标识
 * @property id
 * @type string
 * @readOnly
 */
JS.get ( HashObject.prototype, 'id', function () {
    return this._id || (this._id = '' + this.hashCode);
});

Fire.HashObject = HashObject;
