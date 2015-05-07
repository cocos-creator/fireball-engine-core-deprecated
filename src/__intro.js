(function () {
    var root = this;
    /**
     * !#en
     * Global object with runtime classes, properties and methods you can access from anywhere.
     * Submodules:
     * - [JS](./Fire.JS.html)
     * - [Spine](./Fire.Spine.html)
     *
     * !#zh
     * 可全局访问的公共方法和属性，也会包括一些组件和类的静态方法
     * 包含的子模块:
     * - [JS](./Fire.JS.html)
     * - [Spine](./Fire.Spine.html)
     *
     * @module Fire
     * @main Fire
     */
    var Fire = root.Fire || {};
    var Editor = root.Editor || {};
    Fire.Editor = Editor;
