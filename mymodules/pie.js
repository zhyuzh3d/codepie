/*app(pie)相关的处理函数
 */

var _pie = {};


/*接口：用户创建一个pieApp
创建pie-100(hash)键
创建一个app.js文件在uid/piename/app.js
建立映射键map:pie.name:pie.id
创建set-100(set)键，存放用户的pie列表
为usr-100增加pieArrKey字段指向set-100
req:{name:'...'};
res:{id:100,url:'...'};
*/
_rotr.apis.createPie = function createPie(next) {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var extra = new $qiniu.io.PutExtra();
        var reqbd = ctx.request.body; //POST对象

        //mime文件类型
        var fext = /\.[^\.]+/.exec(reqbd.file);
        fext = (fext && fext.length > 0) ? fext[0] : '';
        extra.mimeType = _mime[fext];

        //token获取
        var filekey = uid + '/';
        if (reqbd.file && reqbd.file.toString() && reqbd != '') {
            filekey += reqbd.file;
        } else {
            filekey += __md5();
        };
        var policy = new $qiniu.rs.PutPolicy(cfg.BucketName + ':' + filekey);

        //存储到七牛
        if (!reqbd.data) reqbd.data = '';
        var res = yield _ctnu($qiniu.io.put, policy.token(), filekey, reqbd.data, extra);
        if (!res || !res.key) throw Error('Upload data failed,cannot get url');

        ctx.xdat.uploadData = res;
        ctx.body = __newMsg(1, 'ok', {
            url: cfg.BucketDomain + res.key,
        });
    });
    return co;
};





_usr.newPieCo = newPieCo;
/*创建一个pie键hash,名称pie-appname;
自动增加_cls（zset）键的pie分数，如果没有自动补充
返回co可链式.then(okfn,errfn)
okfn(pieinfo);
如果中途异常或已经存在，返回包含err的空对象
power:tmpusr
*/
function newPieCo(piename, usrid) {
    var co = $co(function* () {
        var keynm = 'usr-' + piename;
        var mu = _rds.cli.multi();
        mu.hset(keynm, 'id', usr.id);
        mu.hset(keynm, 'nick', usr.nick);
        mu.hset(keynm, 'sex', usr.sex);
        mu.zadd('_map:usr.ukey:usr.id', usr.id, usr.ukey); //ukey到id的映射
        yield _ctnu([mu, 'exec']);
        return usr;
    }).then(null, function (err) {
        __errhdlr(err);
        return {
            _err: err
        };
    })
    return co;
};




_pie.getPieInfoCo = getPieInfoCo;
/*获取一个pie基本数据，如id，路径，作者等
如果出错返回空对象
power:everyone
*/
function getPieInfoCo(piename) {
    varco = $co(function* () {
        var info = yield _ctnu([_rds.cli, 'hgetall'], piename);
        return info;
    }).then(null, function (err) {
        __errhdlr(err);
        return {};
    });
    return res;
};








//导出模块
module.exports = _pie;
