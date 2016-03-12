/*usr相关的处理函数
如新建用户、登陆、注册、验证等等
映射键_map:usr.ukey:usr.id（zset）
*/

var _usr = {};

//基本变量
var tmpNameArr = JSON.parse($fs.readFileSync('mymodules/usr/tmpusr.json', 'utf-8')); //临时用户名
if (!tmpNameArr) throw Error('_usr.js get tmpusrarr failed!');


_usr.newUsrCo = newUsrCo;
/*创建一个usr键hash;格式usr-100;
自动增加_cls（zset）键的usr分数，如果没有自动补充
自动增加_map:usr.ukey:usr.id(hash)键映射
返回co可链式.then(okfn,errfn)
okfn(usr)中usr对象包含id等信息
如果中途异常，返回空对象
power:everyone
*/

function newUsrCo() {
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




//导出模块
module.exports = _usr;
