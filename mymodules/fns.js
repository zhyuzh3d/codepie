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



//导出模块
module.exports = mod;
