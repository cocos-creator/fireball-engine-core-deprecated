/**
 * Base class for asset handling.
 * @class Asset
 * @extends HashObject
 * @constructor
 */
var Asset = Fire.Class({
    name: 'Fire.Asset', extends: Fire.HashObject,

    constructor: function () {
        /**
         * @property _uuid
         * @type string
         * @private
         */
        // define uuid, uuid can not clear while destroying
        Object.defineProperty(this, '_uuid', {
            value: '',
            writable: true,
            enumerable: false   // avoid uuid being assigned to empty string during destroy,
                                // so the _uuid can not display in console.
        });

        /**
         * @property dirty
         * @type boolean
         * @private
         */
        this.dirty = false;
    },

    /**
     * Set raw extname for this asset, this method is used for plugin only.
     * @method _setRawExtname
     * @param {string} extname
     * @private
     */
    _setRawExtname: function (extname) {
        if (this.hasOwnProperty('_rawext')) {
            if (extname.charAt(0) === '.') {
                extname = extname.substring(1);
            }
            this._rawext = extname;
        }
        else {
            Fire.error('Have not defined any RawTypes yet, no need to set raw file\'s extname.');
        }
    }
});

Fire.Asset = Asset;
