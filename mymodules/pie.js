/*app(pie)相关的处理函数
 */

var _pie = {};


/*接口：用户创建一个pieApp
创建pie-100(hash)键
创建一个app.js文件在uid/piename/app.js
建立映射键_map:pie.name:pie.id
创建set-100(set)键，存放用户的pie列表,usr-100.pieSetKey
为usr-100增加pieSetKey字段指向set-100
req:{name:'...'};
res:{id:100,url:'...'};
*/
_rotr.apis.createPie = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;
        var piename = ctx.request.body.name || ctx.query.name;
        if (!piename || piename == '') throw Error('Pie name cannot be undefined.');
        var res = yield createPieCo(uid, piename);
        ctx.body = __newMsg(1, 'OK', res);
        ctx.createPie = res;
        return ctx;
    });
    return co;
};


/*创建一个pieApp并返回基本信息*/
_pie.createPieCo = createPieCo;

function createPieCo(uid, name) {
    var co = $co(function* () {
        //检查用户是否已经存在同名的pieapp,先获取pieSetKey，然后检查是否存在
        var usrkey = 'usr-' + uid;
        var setkey = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pieSetKey');
        if (setkey) {
            var exist = yield _ctnu([_rds.cli, 'sismember'], setkey, name);
            if (exist) {
                throw Error('The pie name [' + name + '] already  exists.')
            };
        };

        //获取自增pieid
        var pieid = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'pie');

        var mu = _rds.cli.multi();

        //存储app.js到uid/appname/...
        var fstr = '/*This line is created by jscodepie.com.\n' + new Date() + '\n*/';
        var filekey = uid + '/' + name + '/app.js';
        var fileobj = yield _qn.uploadDataCo(fstr, filekey);
        var furl = _qn.cfg.BucketDomain + fileobj.key;

        //创建pie-id键hash
        var piekey = 'pie-' + pieid;
        mu.hset(piekey, 'id', pieid);
        if (!name || name == '') name = 'undefined';
        mu.hset(piekey, 'name', name);
        mu.hset(piekey, 'uid', uid);
        mu.hset(piekey, 'url', furl);

        //创建set-100(set)键，存放用户的pie列表,usr-100.pieSetKey
        var setid = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'set');
        var piesetkey = 'set-' + setid;
        mu.sadd(piesetkey, name);
        mu.hset(usrkey, 'pieSetKey', piesetkey);

        //建立映射键_map:pie.name:pie.id
        mu.zadd('_map:pie.name:pie.id', pieid, uid + '/' + name);
        var res = yield _ctnu([mu, 'exec']);

        for (var i = 0; i < res.length; i++) {
            var itm = res[i];
            var errmsg = 'Redis multi err at createPieCo:[' + i + ']' + itm + ':' + JSON.stringify(itm);
            if (itm.code == 'ERR') __errhdlr(new Error(errmsg));
        };

        var pie = {
            id: pieid,
            name: name,
            uid: uid,
            url: furl,
        };
        return pie;
    });
    return co;
};



/*获取我的pie列表*/



/*删除一个pie*/









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
