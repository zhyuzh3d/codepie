/*扩展系统对象功能或者提供新功能
JSON.safeParse/JSON.sparse;
*/

var mod = {};


/*扩展JSON.safeParse*/
JSON.safeParse = JSON.sparse = function (str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return undefined;
    }
};


/*重新封装console的函数*/
console.xerr = function () {
    var args = auguments;
    console.error(args);
};
console.xlog = function () {
    var args = auguments;
    console.log(args);
};
console.xinfo = function () {
    var args = auguments;
    console.info(args);
};
console.xwarn = function () {
    var args = auguments;
    console.xwarn(args);
};



//导出模块
module.exports = mod;
