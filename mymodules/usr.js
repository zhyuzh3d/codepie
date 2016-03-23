/*usr相关的处理函数
如新建用户、登陆、注册、验证等等
映射键_map:usr.ukey:usr.id（zset）
*/

var _usr = {};

//基本变量
var tmpNameArr = JSON.parse($fs.readFileSync('mymodules/usr/tmpusr.json', 'utf-8')); //临时用户名
if (!tmpNameArr) throw Error('_usr.js get tmpusrarr failed!');


_usr.createUsrCo = createUsrCo;
/*创建一个usr键hash;格式usr-100;
自动增加_cls（zset）键的usr分数，如果没有自动补充
自动增加_map:usr.ukey:usr.id(hash)键映射
返回co可链式.then(okfn,errfn)
okfn(usr)中usr对象包含id等信息
如果中途异常，返回空对象
power:everyone
*/

function createUsrCo() {
    var co = $co(function* () {
        var usr = tmpNameArr[Math.floor(Math.random() * tmpNameArr.length)]; //随机临时用户
        usr.id = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'usr');
        usr.ukey = __uuid();

        var keynm = 'usr-' + usr.id;
        var mu = _rds.cli.multi();
        mu.hset(keynm, 'id', usr.id);
        mu.hset(keynm, 'nick', usr.nick);
        mu.hset(keynm, 'sex', usr.sex);
        mu.zadd('_map:usr.ukey:usr.id', usr.id, usr.ukey); //ukey到id的映射
        yield _ctnu([mu, 'exec']);
        return usr;
    }).then(null, function (err) {
        __errhdlr(err);
        return {};
    })
    return co;
};


_usr.getPowerByHttpCC = getPowerByHttpCC;
/*根据http头获取用户相对于当前pie的权限
需要有xdat.uid和xdat.pie;
添加到xdat.upower
*/
function getPowerByHttpCC() {
    var ctx = this;
    var co = $co(function* () {
        ctx.xdat.upower = 0; //???
    });
    return co;
};

_usr.getUidByHttpCC = getUidByHttpCC;
/*Co,Call:通过ukey获取uid,需要call调用
添加到xdat.uid
*/
function getUidByHttpCC() {
    var ctx = this;
    var co = $co(function* () {
        //根据ukey读取uid
        var ukey = ctx.xdat.ukey;
        if (!ukey) return;

        var uid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
        if (!uid) {
            //如果uid不存在，那么ukey是非法的，清理掉
            ctx.cookies.set('ukey', undefined);
            return 0;
        };
        ctx.xdat.uid = uid;
    });
    return co;
};


/*注册验证码的邮件文字内容*/
var mailRegCodeHtml = $fs.readFileSync('mymodules/usr/regMail.html', 'utf-8');

/*接口：用邮箱绑定当前账号uid
系统自动向这个邮箱发一个邮件，带有一个六位数字，输入这个数字才能完成验证，然后才能输入密码注册成功
req:{email:'..@..',resend:0}
res:null
*/
_rotr.apis.sendRegCodeToMail = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;
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
        mu.expire(rkey, 24 * 3600 * 1000);
        var rdsres = yield _ctnu([mu, 'exec']);

        //发送的内容
        var cont = mailRegCodeHtml.replace('{{regCode}}', regcode);
        var res = yield _fns.sendMail(mail, 'The register code from jscodepie.com', cont);
        ctx.body = res;

        ctx.xdat.sendRegCodeToMail = res;
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
        var uid = ctx.xdat.uid;

        var mail = ctx.query.mail || ctx.request.body.mail;
        if (!mail || !_cfg.regx.mail.test(mail)) throw Error('Mail format err.')
        var regCode = ctx.query.regCode || ctx.request.body.regCode;
        if (!regCode || !_cfg.regx.code6.test(regCode)) throw Error('Registration code format err.')
        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!regCode || !_cfg.regx.pw.test(regCode)) throw Error('Password format err.');

        //读取临时键的regCode值
        var rkey = '_tmp:mailReg:' + mail;
        var regcode = yield _ctnu([_rds.cli, 'hget'], rkey, 'regCode');
        if (!regcode) throw Error('Has not send the registration code to email[' + mail + ']');
        if (regCode != regcode) throw Error('The code is not match.');

        //将pw再次加密写入数据库,删除临时key
        var usrkey = 'usr-' + uid;
        var pw = __md5(pw + mail);
        var mu = _rds.cli.multi();
        mu.hset(usrkey, 'mail', mail);
        mu.hset(usrkey, 'pw', pw);
        mu.del(rkey);
        var res = yield _ctnu([mu, 'exec']);

        ctx.body = __newMsg(1, 'OK');
        ctx.xdat.bindMail = res;

        return ctx;
    });
    return co;
};







//导出模块
module.exports = _usr;
