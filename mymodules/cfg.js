/*所有设置参数
必须在app文件夹外面有合法的xcfg.json用以保存私密参数
xcfg文件json的读写功能
*/

var cfg = {};

cfg.xcfg = function () {
    var xstr = $fs.readFileSync('../xcfg.json', 'utf-8');
    var xobj = JSON.sparse(xstr);
    return xobj;
}();







//导出模块
module.exports = cfg;
