/*usr相关的处理函数
如新建用户、登陆、注册、验证等等
映射键_map:usr.ukey:usr.id（zset）
*/

var _usr = {};

//基本变量
var tmpNameArr = JSON.parse($fs.readFileSync('mymodules/src/tmpusr.json', 'utf-8')); //临时用户名
if (!tmpNameArr) throw Error('_usr.js get tmpusrarr failed!');


_usr.createUsrCo = createUsrCo;
/*函数：创建一个usr键hash;格式usr-100;
自动增加_cls（zset）键的usr分数，如果没有自动补充
自动增加_map:usr.ukey:usr.id(hash)键映射
返回co可链式.then(okfn,errfn)
okfn(usr)中usr对象包含id等信息
如果中途异常，返回空对象
power:everyone
*/

function createUsrCo(uid) {
    var co = $co(function* () {
        var usr = tmpNameArr[Math.floor(Math.random() * tmpNameArr.length)]; //随机临时用户
        if (uid) {
            usr.id = uid;
        } else {
            usr.id = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'usr');
        };
        usr.ukey = __uuid();

        var keynm = 'usr-' + usr.id;
        var mu = _rds.cli.multi();
        mu.hset(keynm, 'id', usr.id);
        mu.hset(keynm, 'nick', usr.nick);
        mu.hset(keynm, 'sex', usr.sex);
        mu.hset(keynm, 'ukey', usr.ukey);
        mu.zadd('_map:usr.ukey:usr.id', usr.id, usr.ukey); //ukey到id的映射
        yield _ctnu([mu, 'exec']);
        return usr;
    }).then(null, function (err) {
        __errhdlr(err);
        return {};
    })
    return co;
};


/*函数：根据http头获取用户相对于当前pie的权限
需要有xdat.uid和xdat.pie;
添加到xdat.upower
*/
_usr.getPowerByHttpCC = getPowerByHttpCC;

function getPowerByHttpCC() {
    var ctx = this;
    var co = $co(function* () {
        ctx.ginfo.upower = 0;
    });
    return co;
};

/*函数：Co,Call:通过ukey获取uid,需要call调用
添加到xdat.uid
*/
_usr.getUidByHttpCC = getUidByHttpCC;

function getUidByHttpCC() {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey读取uid
        var ukey = ctx.ginfo.ukey;
        if (!ukey) return;

        var uid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
        if (!uid) {
            //如果uid不存在，那么ukey是非法的，清理掉
            ctx.cookies.set('ukey', undefined);
            return 0;
        };
        ctx.ginfo.uid = uid;
    });
    return co;
};





/*注册验证码的邮件文字内容*/
var mailRegCodeHtml = $fs.readFileSync('mymodules/src/regMail.html', 'utf-8');

/*接口：用邮箱绑定当前账号uid
系统自动向这个邮箱发一个邮件，带有一个六位数字，输入这个数字才能完成验证，然后才能输入密码注册成功
req:{email:'..@..',resend:0}
res:null
*/
_rotr.apis.sendRegCodeToMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format error.');
        var resend = ctx.query.resend || ctx.request.body.resend;

        //使用_map:usr.mail:usr.id键检查邮箱有没有被使用并成功注册，如果已经使用，那么抛出err
        var isreged = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.mail:usr.id', mail);
        if (isreged == 1) throw Error('The email[' + mail + '] is registered.');

        //使用_tmp:mailReg:mail（hash）键是否存在，如果存在，那么使用已有的regCode，否则生成新的
        var rkey = '_tmp:mailReg:' + mail;
        var regcode = yield _ctnu([_rds.cli, 'hget'], rkey, 'regCode');

        //如果不是重发，那么抛出err
        if (regcode && resend == 0) throw Error('The email[' + mail + '] is used.');
        if (!regcode || regcode == 0) regcode = Math.floor(100000 + Math.random() * 900000);

        //发送一个验证码，并且把这个验证码写入到数据库regCode:mail:code(hash)只读，一天过期，用完删除
        var mu = _rds.cli.multi();
        mu.hset(rkey, 'regCode', regcode);
        mu.expire(rkey, 24 * 3600);
        var rdsres = yield _ctnu([mu, 'exec']);

        //发送的内容
        var cont = mailRegCodeHtml.replace('{{regCode}}', regcode);
        var res = yield _fns.sendMail(mail, 'The register code from jscodepie.com', cont);
        ctx.body = res;

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};



/*绑定邮箱到当前用户;根据邮箱注册验证码检查
成功后写入数据库usr.mail和usr.pw
req:{mail:'..@..',regCode:666777,pw:'...'};
res:{};
*/
_rotr.apis.bindMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.')
        var regCode = ctx.query.regCode || ctx.request.body.regCode;
        if (!regCode || !_cfg.regx.code6.test(regCode)) throw Error('Registration code format err.')
        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw || !_cfg.regx.pw.test(pw)) throw Error('Password format err.');

        //读取临时键的regCode值
        var rkey = '_tmp:mailReg:' + mail;
        var regcode = yield _ctnu([_rds.cli, 'hget'], rkey, 'regCode');
        if (!regcode) throw Error('Has not send the registration code to email[' + mail + ']');
        if (regCode != regcode) throw Error('The code is not match.');

        //将pw再次加密写入数据库,删除临时key,创建_map:usr.mail:usr.id
        var usrkey = 'usr-' + uid;
        var pw = __md5(pw + mail);
        var mu = _rds.cli.multi();
        mu.hset(usrkey, 'mail', mail);
        mu.hset(usrkey, 'pw', pw);
        mu.del(rkey);
        mu.zadd('_map:usr.mail:usr.id', uid, mail);
        var res = yield _ctnu([mu, 'exec']);

        ctx.body = __newMsg(1, 'OK');

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};







/*修改邮箱账号密码的接口,
可以修改非当前用户的密码，所以可以使用邮箱内重置后的密码
req:{mail:'..@..',orgPw:'...',newPw:'...',isRest:false};
res:{};
*/
_rotr.apis.changePw = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.')
        var opw = ctx.query.orgPw || ctx.request.body.orgPw;
        if (!opw || !_cfg.regx.pw.test(opw)) throw Error('Orignal password format err.');
        var npw = ctx.query.newPw || ctx.request.body.newPw;
        if (!npw || !_cfg.regx.pw.test(npw)) throw Error('New password format err.');

        //获取邮箱对应的uid
        var usrid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.mail:usr.id', mail);
        if (!usrid) throw Error('Mail[' + mail + '] has not registered.');
        var usrkey = 'usr-' + usrid;

        //新旧密码是否一致;如果是重置那么检查usr.restPwKey键的值，否则对比usr.pw;
        var pw;
        var rstpwkey;
        var isRest = ctx.query.isRest || ctx.request.body.isRest;
        if (isRest) {
            rstpwkey = yield _ctnu([_rds.cli, 'hget'], usrkey, 'resetPwKey');
            if (!rstpwkey) throw Error('The restCode has expired.');
            pw = yield _ctnu([_rds.cli, 'get'], rstpwkey);
        } else {
            pw = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pw');
        };
        var eopw = __md5(opw + mail);
        if (eopw != pw) throw Error('Password does not match');

        //纪录新的密码,把重置密码改为null,因为req的opw如果等于null上面已经抛出
        var enewpw = __md5(npw + mail);
        var mu = _rds.cli.multi();
        mu.hset(usrkey, 'pw', enewpw);
        if (isRest) {
            mu.del(rstpwkey);
        }
        var res = yield _ctnu([mu, 'exec']);

        ctx.body = __newMsg(1, 'OK');

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*重置密码的邮件文字内容*/
var mailResetPwHtml = $fs.readFileSync('mymodules/src/resetPwMail.html', 'utf-8');

/*向邮箱发送重置密码，未登录也可以使用
通过邮箱查找uid,找到usr键，
生成8位代码,加密后写入_tmp:resetPw:mail键，1天过期；同时指定到usr-1.resetPwKey
然后将8位代码发送到指定邮箱??
*/
_rotr.apis.sendResetPwToMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.');

        //查找mail对应的usrid是否存在
        var usrid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.mail:usr.id', mail);
        if (!usrid) throw Error('Mail[' + mail + '] has not registered.');
        var usrkey = 'usr-' + usrid;

        //生成重置的6位密码,加密后写入数据库，1天过期，指定到usr-1.resetPwKey
        var rstpw = Math.random().toString(36).substr(2).substr(0, 8);
        var epw = __md5(rstpw + mail);
        var tmpkey = '_tmp:resetPw:' + mail;
        var mu = _rds.cli.multi();
        mu.set(tmpkey, epw);
        mu.expire(tmpkey, 24 * 3600);
        mu.hset(usrkey, 'resetPwKey', tmpkey);
        var res = yield _ctnu([mu, 'exec']);

        //发送邮件
        var cont = mailResetPwHtml.replace('{{resetPw}}', rstpw);
        var res = yield _fns.sendMail(mail, 'The reset password from jscodepie.com', cont);

        ctx.body = __newMsg(1, 'OK', res);

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*邮箱登陆接口
根据邮箱mail和pw登陆
req:{mail:'..@..',pw:'..'}
res:{id:33,name:'..',...}
*/

_rotr.apis.loginByMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.');
        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw || !_cfg.regx.pw.test(pw)) throw Error('Password format err.');

        //获取usrid
        var usrid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.mail:usr.id', mail);
        if (!usrid) throw Error('Mail[' + mail + '] has not registered.');
        var usrkey = 'usr-' + usrid;

        //检查pw是否匹配
        var rpw = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pw');
        var epw = __md5(pw + mail);
        if (epw != rpw) throw Error('The password not match.')

        //读取全部信息并筛选
        var usr = yield _ctnu([_rds.cli, 'hgetall'], usrkey);
        var res = filterUsrProfile(usr);

        //把ukey写入cookie,改变uid
        ctx.cookies.set('ukey', usr.ukey);
        ctx.body = __newMsg(1, 'OK', res);

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};

/*获取当前账号个人信息接口
没注册绑定的也可以获取
req:{}
res:{id:23,name:'..',sex:'...',...}
*/
_rotr.apis.getMyProfile = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var usrkey = 'usr-' + uid;

        //读取全部信息并筛选
        var usr = yield _ctnu([_rds.cli, 'hgetall'], usrkey);
        var res = filterUsrProfile(usr);

        //把ukey写入cookie,改变uid
        ctx.body = __newMsg(1, 'OK', res);

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};

/*函数：过滤用户信息方法
把hgetall得到的数据过滤剩下可以返回前端的数据
白名单制*/
function filterUsrProfile(usr, attrarr) {
    var res = {};
    if (!attrarr) attrarr = ['id', 'nick', 'sex', 'mail'];
    attrarr.forEach(function (attr, i) {
        res[attr] = usr[attr];
    });
    return res;
};


/*修改个人档案接口
根据req的uid修改，只能修改自己的
req:{nick:'...',sex:0};
res:{}
*/
_rotr.apis.setProfile = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var usrkey = 'usr-' + uid;

        var nick = ctx.query.nick || ctx.request.body.nick;
        if (!nick || !_cfg.regx.nick.test(nick)) throw Error('Nick format err.');
        var sex = ctx.query.sex || ctx.request.body.sex;
        if (!sex || !_cfg.regx.sex.test(sex)) throw Error('Sex format err.');

        //写入数据库
        var mu = _rds.cli.multi();
        mu.hset(usrkey, 'nick', nick);
        mu.hset(usrkey, 'sex', sex);
        var res = yield _ctnu([mu, 'exec']);

        //把ukey写入cookie,改变uid
        ctx.body = __newMsg(1, 'OK');

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*通过usr.mail获取uid等基础信息
{mail:'...'}
{uid:12,nick:'..',sex:'..'}
*/
_rotr.apis.getUsrInfoByMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.');

        //获取uid
        var theuid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.mail:usr.id', mail);
        if (!theuid) throw Error('Cant find the user.');

        //获取usr信息
        var theusr = yield getUsrInfoByUidCo(theuid);
        ctx.body = __newMsg(1, 'OK', theusr);

        ctx.apiRes = theusr;
        return ctx;
    });
    return co;
};

/*通过usr.id获取uid等基础信息
{id:'...'}
{uid:12,nick:'..',sex:'..'}
*/
_rotr.apis.getUsrInfoByUid = function () {
    var ctx = this;
    var co = $co(function* () {
        var theuid = ctx.query.id || ctx.request.body.id;
        if (!theuid || !_cfg.regx.int.test(theuid)) throw Error('User id format err.');

        //获取usr信息
        var theusr = yield getUsrInfoByUidCo(theuid);
        ctx.body = __newMsg(1, 'OK', theusr);

        ctx.apiRes = theusr;
        return ctx;
    });
    return co;
};

/*根据uid获取其它usr的基本信息
这是最基础的获取其他usr信息的基础
*/
function getUsrInfoByUidCo(uid) {
    var co = $co(function* () {
        var mu = _rds.cli.multi();
        mu.hmget('usr-' + uid, 'id', 'nick', 'sex');
        var res = yield _ctnu([mu, 'exec']);
        if (!res[0] || !res[0][0]) throw Error('User does not exist.');
        var uinfo = res[0];
        var usr = {
            id: uinfo[0],
            nick: uinfo[1],
            sex: uinfo[2],
        }
        return usr;
    });
    return co;
};

/*退出登录,清理掉客户端的cookie里的ukey
{}
{}
*/

_rotr.apis.logout = function () {
    var ctx = this;
    var co = $co(function* () {
        ctx.cookies.set('ukey', undefined);
        ctx.body = __newMsg(1, 'OK');

        ctx.apiRes = undefined;
        return ctx;
    });
    return co;
};




//导出模块
module.exports = _usr;
