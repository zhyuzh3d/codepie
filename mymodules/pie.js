/*app(pie)相关的处理函数
 */

var _pie = {};

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
