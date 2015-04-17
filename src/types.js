/**
 * @class TextAlign
 * @static
 */
Fire.TextAlign = Fire.defineEnum({
    /**
     * @property left
     * @type {number}
     */
    left: -1,
    /**
     * @property center
     * @type {number}
     */
    center: -1,
    /**
     * @property right
     * @type {number}
     */
    right: -1
});



/**
 * @class TextAnchor
 * @static
 */
Fire.TextAnchor = (function (t) {
    /**
     * @property topLeft
     * @type {number}
     */
    t[t.topLeft = 0] = 'Top Left';
    /**
     * @property topCenter
     * @type {number}
     */
    t[t.topCenter = 1] = 'Top Center';
    /**
     * @property topRight
     * @type {number}
     */
    t[t.topRight = 2] = 'Top Right';
    /**
     * @property midLeft
     * @type {number}
     */
    t[t.midLeft = 3] = 'Middle Left';
    /**
     * @property midCenter
     * @type {number}
     */
    t[t.midCenter = 4] = 'Middle Center';
    /**
     * @property midRight
     * @type {number}
     */
    t[t.midRight = 5] = 'Middle Right';
    /**
     * @property botLeft
     * @type {number}
     */
    t[t.botLeft = 6] = 'Bottom Left';
    /**
     * @property botCenter
     * @type {number}
     */
    t[t.botCenter = 7] = 'Bottom Center';
    /**
     * @property botRight
     * @type {number}
     */
    t[t.botRight = 8] = 'Bottom Right';
    return t;
})({});
