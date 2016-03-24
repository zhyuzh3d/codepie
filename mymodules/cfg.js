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





/*各种正则表达式*/
_cfg.regx = {
    mail: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    code6: /^\d{6}$/, //6位数字
    pw: /^[0-9a-z]{8,32}$/, //8位验证码或者32位hex
    nick: /^.{1,32}$/, //1～32位非回车
    sex: /^[012]{1}$/, //0,1,2
    pieName: /[0-9a-zA-Z\.]{3,32}/, //必须英文，但可以用点
};





//导出模块
module.exports = _cfg;
