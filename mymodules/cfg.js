/*所有设置参数
必须在app文件夹外面有合法的xcfg.json用以保存私密参数
xcfg文件json的读写功能
*/

var _cfg = {};

/*全局错误代码*/
var __errCode = global.__errCode = {
    RDS: 8933, //redis读写错误
    EXISTS: 3222, //已经重复存在导致的错误
    NOTFOUND: 4312, //找不到目标
    FNERR: 9877, //程序异常，未知错误
    NOUSR: 5422, //程序异常，未知错误
    APIERR: 8788, //程序异常，未知错误
};

/*常用错误信息*/
var __errMsgs = global.__errMsgs = {
    usrUnkown: __newMsg(__errCode.NOUSR, 'You are not signed in.'),
};


/*用户相遇对pie的权限*/
var __usrPower = global.__usrPower = {
    unkown: 0, //未知
    usr: 10, //普通用户
    member: 20, //使用成员
    manager: 30, //使用成员的管理者
    partner: 40, //联合开发者
    author: 50, //作者开发者
    service: 60, //网站客服
    admin: 70, //网站管理员
    boss: 100, //网站最高管理员
};



/*外部的密匙文件读取到xcfg对象*/
_cfg.xcfg = function () {
    var xstr = $fs.readFileSync('../xcfg.json', 'utf-8');
    var xobj = JSON.sparse(xstr);
    return xobj;
}();

/*读取外部密匙文件的函数,返回promise*/
_cfg.xcfgCo = function () {
    var co = $co(function* () {
        var xstr = yield _ctnu($fs.readFile, '../xcfg.json', 'utf-8');
        var xcfg = JSON.sparse(xstr);
        return xcfg;
    }).then(null, function (err) {
        __errhdlr(err);
        return {};
    })
    return co;
};








//导出模块
module.exports = _cfg;
