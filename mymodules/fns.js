/*扩展系统对象功能或者提供新功能
JSON.safeParse/JSON.sparse;
*/

var fns = {};


/*扩展JSON.safeParse*/
JSON.safeParse = JSON.sparse = function (str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return undefined;
    }
};

/*扩展一个方法或对象*/
function extend(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
}


/*重新封装console的函数*/
var cnslPreStr = '>';
console.xerr = function () {
    var args = arguments;
    console.info(cnslPreStr, 'ERR:');
    console.error.apply(this, args);
};
console.xlog = function () {
    var args = arguments;
    console.info(cnslPreStr, 'LOG:');
    console.log.apply(this, args);
};
console.xinfo = function () {
    var args = arguments;
    console.info(cnslPreStr, 'INFO:');
    console.info.apply(this, args);
};
console.xwarn = function () {
    var args = arguments;
    console.info(cnslPreStr, 'WARN:');
    console.xwarn.apply(this, args);
};


/*专用err处理函数,适合co().then()使用*/
global._errhdlr = _errhdlr;

function _errhdlr(err) {
    console.xerr(err.stack);
};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global._nullhdlr = _nullhdlr;

function _nullhdlr(res) {};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global._infohdlr = _infohdlr;

function _infohdlr(res) {
    console.xinfo(res);
};

/*专用空函数，只纪录日志不做额外处理,适合co().then()使用*/
global._loghdlr = _loghdlr;

function _loghdlr(res) {
    console.xlog(res);
};







//导出模块
module.exports = fns;
