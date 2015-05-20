/**
 * !#en Image Type
 * @enum ImageType
 */
Fire.ImageType = Fire.defineEnum({
    /**
     * Simple
     * @property Simple
     * @type {number}
     */
    Simple: -1,
    /**
     * Sliced
     * @property Sliced
     * @type {number}
     */
    Sliced: -1
    /**
     * Filled
     * @property Filled
     * @type {number}
     */
    //Filled: -1,
    /**
     * Tiled
     * @property Tiled
     * @type {number}
     */
    //Tiled: -1
});

/**
 * !#en Text alignment
 * !#zh 文字对齐方式
 * @enum TextAlign
 */
Fire.TextAlign = Fire.defineEnum({
    /**
     * !#en Align to the left !#zh 文字靠左对齐
     * @property left
     * @type {number}
     */
    Left: -1,
    /**
     * @property center
     * @type {number}
     */
    Center: -1,
    /**
     * @property right
     * @type {number}
     */
    Right: -1
});

/**
 * @enum TextAnchor
 */
Fire.TextAnchor = Fire.defineEnum({
    /**
     * @property top left
     * @type {number}
     */
    TopLef: -1,
    /**
     * @property top center
     * @type {number}
     */
    TopCenter: -1,
    /**
     * @property top right
     * @type {number}
     */
    TopRight: -1,
    /**
     * @property midd leLeft
     * @type {number}
     */
    MiddleLeft: -1,
    /**
     * @property middle center
     * @type {number}
     */
    MiddleCenter: -1,
    /**
     * @property middle right
     * @type {number}
     */
    MiddleRight: -1,
    /**
     * @property bottom left
     * @type {number}
     */
    BottomLeft: -1,
    /**
     * @property bottom center
     * @type {number}
     */
    BottomCenter: -1,
    /**
     * @property bottom right
     * @type {number}
     */
    BottomRight: -1,
});

/**
 * @enum FontType
 */
Fire.FontType = Fire.defineEnum({
    /**
     * @property Arial
     * @type {number}
     */
    Arial: -1,
    /**
     * @property Custom
     * @type {number}
     */
    Custom: -1
});
