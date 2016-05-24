/*app(pie)相关的处理函数
 */

var _pie = {};


/*接口：用户创建一个pieApp
创建pie-100(hash)键
创建一个app.js文件在uid/piename/app.js
建立映射键_map:pie.path:pie.id
创建set-100(set)键，存放用户的pie列表,usr-100.pieSetKey
为usr-100增加pieSetKey字段指向set-100
req:{name:'...'};
res:{id:100,url:'...'};
*/
_rotr.apis.createPie = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var piename = ctx.request.body.name || ctx.query.name;
        if (!piename || piename == '') throw Error('Pie name cannot be undefined.');
        var res = yield createPieCo(uid, piename);
        ctx.body = __newMsg(1, 'OK', res);
        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*创建一个pieApp并返回基本信息*/
var pieTemplate = $fs.readFileSync('mymodules/src/template.js', 'utf-8');
_pie.createPieCo = createPieCo;

function createPieCo(uid, name) {
    var co = $co(function* () {
        var usrkey = 'usr-' + uid;

        //检查是否有重名
        var ppath = uid + '/' + name;
        var exist = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', ppath);
        if (exist) throw Error('The pie name [' + name + '] already  exists.')

        //获取usr.piesetkey，如果没有就创建
        var setkey = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pieSetKey');
        if (!setkey) {
            var setid = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'set');
            setkey = 'set-' + setid;
            yield _ctnu([_rds.cli, 'hset'], usrkey, 'pieSetKey', setkey);
        };


        //获取自增pieid
        var pieid = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'pie');

        var mu = _rds.cli.multi();

        //存储app.js到uid/appname/...
        var fstr = '/*This line is created by jscodepie.com.\n' + new Date() + '\n*/';
        fstr += pieTemplate;

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
        mu.hset(piekey, 'state', 1);

        //存入pieset列表
        mu.sadd(setkey, pieid);

        //建立映射键_map:pie.path:pie.id
        mu.zadd('_map:pie.path:pie.id', pieid, uid + '/' + name);
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



/*获取我的pie列表
req:{}
res:{count:12,pies:[{id:13,name:'..',url:'...'}]}
*/
_rotr.apis.getPieList = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;
        var res = yield getPieListCo(uid);
        if (res.constructor == String) {
            ctx.body = __newMsg(-1, res, {});
        } else {
            ctx.body = __newMsg(1, 'OK', res);
        };

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*获取某用户的pie列表*/
_pie.getPieListCo = getPieListCo;

function getPieListCo(uid) {
    var co = $co(function* () {
        //拿到set列表
        var usrkey = 'usr-' + uid;
        var setkey = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pieSetKey');
        if (!setkey) return '您还没有创建应用.';

        var pidarr = yield _ctnu([_rds.cli, 'smembers'], setkey);
        if (!pidarr || pidarr.length < 1) return '应用列表为空.';

        //逐个读取pie信息
        var mu = _rds.cli.multi();
        for (var i in pidarr) {
            var pkey = 'pie-' + pidarr[i];
            mu.hgetall(pkey);
        };
        var piearr = yield _ctnu([mu, 'exec']);

        //组成最终返回数据
        var res = {
            count: piearr.length,
            pieArr: piearr,
        };

        return res;
    });
    return co;
};


/*设置pie的state，可以用来作为删除或恢复使用
只能设置自己的pie
req:{name:'...',state}
res:{}
*/
_rotr.apis.setPieStateByName = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var name = ctx.query.name || ctx.request.body.name;
        if (!name || !_cfg.regx.pieName.test(name)) throw Error('Pie name format error.');

        var state = ctx.query.state || ctx.request.body.state;
        if (!state || !/\d+/.test(state)) throw Error('State format error.');

        var res = yield setPieStateByNameCo(uid, name, state);
        ctx.body = __newMsg(1, 'OK');
        return ctx;
    });
    return co;
};


/*设置pie的state状态为移除
因为uid已经限制了权限，所以可以直接操作
*/
_pie.setPieStateByNameCo = setPieStateByNameCo;

function setPieStateByNameCo(uid, pname, state) {
    var co = $co(function* () {
        var usrkey = 'usr-' + uid;
        var piename = uid + '/' + pname;

        //找到pid
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', piename);
        if (!pid) throw Error('Can not find the pie id [' + pname + ']');

        //设置state,先检查是否存在
        var piekey = 'pie-' + pid;
        var isExsist = yield _ctnu([_rds.cli, 'exists'], piekey);
        if (!isExsist) throw Error('The pie [' + pname + '] does not exists.')
        var res = yield _ctnu([_rds.cli, 'hset'], piekey, 'state', state);

        return res;
    });
    return co;
};

/*设置pie的state，可以用来作为删除或恢复使用
req:{id:'...',state:-1}
res:{}
*/
_rotr.apis.setPieStateByPid = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var pid = ctx.query.id || ctx.request.body.id;
        if (!pid || !_cfg.regx.int.test(pid)) throw Error('Pie id format error.');

        var state = ctx.query.state || ctx.request.body.state;
        if (!state || !_cfg.regx.int.test(state)) throw Error('State format error.');

        var res = yield setPieStateByPidCo(uid, pid, state);
        ctx.body = __newMsg(1, 'OK');
        return ctx;
    });
    return co;
};


/*设置pie的state状态为移除
验证权限，然后操作
检查uid一定要和puid一致才能修改，只能设置自己的pie
*/
_pie.setPieStateByPidCo = setPieStateByPidCo;

function setPieStateByPidCo(uid, pid, state) {
    var co = $co(function* () {
        //设置state,先检查是否存在
        var piekey = 'pie-' + pid;
        var isExsist = yield _ctnu([_rds.cli, 'exists'], piekey);
        if (!isExsist) throw Error('The pie [' + pname + '] does not exists.')

        //检查用户身份是否pie作者
        var puid = yield _ctnu([_rds.cli, 'hget'], piekey, 'uid');
        if (puid != uid) throw Error('The pie is not yours.');

        //修改状态
        var res = yield _ctnu([_rds.cli, 'hset'], piekey, 'state', state);
        return res;
    });
    return co;
};



/*使用pieUid和pieName获取pie的基本信息，如作者、js路径、pieId等
这些信息都是公开的，因此可以获取其他人的pie信息
req:{uid:12,name:'...'},authorId为空默认值为自己的uid
res:{id:12,name:'...',uid:12,url:'...',power:'...'}
*/
_rotr.apis.getPieInfoByPuidPnm = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var name = ctx.query.name || ctx.request.body.name;
        if (!name || !_cfg.regx.pieName.test(name)) throw Error('应用名称格式错误.');

        var authid = ctx.query.uid || ctx.request.body.uid;
        if (authid && !_cfg.regx.int.test(authid)) throw Error('作者编号格式错误.');
        if (!authid) authid = uid;

        //找到pid
        var ppath = authid + '/' + name;
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', ppath);
        if (!pid) throw Error('找不到这个应用的信息[' + ppath + ']');

        var res = yield getPieInfoByPidCo(pid);
        res.power = (res.uid == uid) ? 'author' : 'usr';
        ctx.body = __newMsg(1, 'OK', res);

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};

/*使用id获取pie的基本信息，如作者、js路径、pieId等
这些信息都是公开的，因此可以获取其他人的pie信息
req:{id:12}
res:{id:12,name:'...',uid:12,url:'...',power:'...'}
*/
_rotr.apis.getPieInfoByPid = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.ginfo.uid;

        var thepid = ctx.query.id || ctx.request.body.id;
        if (!thepid || !_cfg.regx.int.test(thepid)) throw Error('应用ID格式错误.');

        var res = yield getPieInfoByPidCo(thepid);
        //加入权限写入
        res.power = (res.uid == uid) ? 'author' : 'usr';
        ctx.body = __newMsg(1, 'OK', res);
        ctx.apiRes = res;
        return ctx;
    });
    return co;
};

/*通过pid获取pie的基本信息，这是获取pie公开信息的基本接口
这些信息时公开的，所以没有限制
*/
_pie.getPieInfoByPidCo = getPieInfoByPidCo;

function getPieInfoByPidCo(pid) {
    var co = $co(function* () {
        //先检查是否存在
        var piekey = 'pie-' + pid;
        var isExsist = yield _ctnu([_rds.cli, 'exists'], piekey);
        if (!isExsist) throw Error('The pie [' + pname + '] does not exists.');

        //获取pie的基本信息,附加权限信息
        var pinfo = yield _ctnu([_rds.cli, 'hgetall'], piekey);
        var res = {
            id: pinfo.id,
            name: pinfo.name,
            uid: pinfo.uid,
            url: pinfo.url,
        };
        return res;
    });
    return co;
};



/*获取pie的基本信息，这些信息时公开的，所以没有限制
 */
_pie.getPieInfoCo = getPieInfoCo;

function getPieInfoCo(uid, pname) {
    var co = $co(function* () {
        var usrkey = 'usr-' + uid;
        var piename = uid + '/' + pname;

        //找到pid
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', piename);
        if (!pid) throw Error('Can not find the pie id [' + pname + ']');

        //先检查是否存在
        var piekey = 'pie-' + pid;
        var isExsist = yield _ctnu([_rds.cli, 'exists'], piekey);
        if (!isExsist) throw Error('The pie [' + pname + '] does not exists.');

        //获取pie的基本信息,附加权限信息
        var kinfo = yield _ctnu([_rds.cli, 'hgetall'], piekey);
        var pwr = (kinfo.uid == uid) ? 'author' : 'usr';
        var res = {
            id: kinfo.id,
            name: kinfo.name,
            uid: kinfo.uid,
            url: kinfo.url,
            power: pwr,
        };

        return res;
    });
    return co;
};


/*函数：通过req的地址栏获取pname和puid*/
_pie.getPinfoByUrl = getPinfoByUrl;

function getPinfoByUrl(url) {
    url = decodeURI(url);
    url = url.split("?")[0];
    var spos = url.indexOf('/pie/');
    var pname = (spos != -1) ? url.substr(spos + 5) : undefined;
    if (pname == '') pname = undefined;
    var puid;
    if (pname) {
        //如果没有uid，补足1
        var slashpos = pname.indexOf('/');
        if (slashpos == -1) {
            puid = 1;
            pname = puid + '/' + pname;
        } else {
            puid = Number(pname.substr(0, slashpos));
        };
    };
    return {
        pname: pname,
        puid: puid,
    };
};


/*检查是否pie名称已经存在重复的接口
{psname:'editor',uid:1}//uid默认为当前用户id
{};
*/
_rotr.apis.isPieExists = function () {
    var ctx = this;
    var co = $co(function* () {
        var pname = ctx.query.pname || ctx.request.body.pname;
        if (!pname) throw Error('Pie name can not be undefined.');

        var puid = ctx.query.puid || ctx.request.body.puid;
        if (!puid && !_cfg.regx.int.test(puid)) puid = ctx.ginfo.uid;
        var ppath = puid + '/' + pname;
        var exist = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', ppath);
        var res = (!exist) ? false : true;

        ctx.body = __newMsg(0, 'OK', {
            isExists: res
        });

        ctx.apiRes = res;
        return ctx;
    });
    return co;
};


/*重命名pie的接口
{orgName:'xxx',newName:'xxx'}
{}
*/
_rotr.apis.renamePie = function () {
    var ctx = this;
    var co = $co(function* () {
        var orgName = ctx.query.orgName || ctx.request.body.orgName;
        if (!orgName) throw Error('Orginal name can not be undefined.');

        var newName = ctx.query.newName || ctx.request.body.newName;
        if (!newName) throw Error('New name can not be undefined.');

        var uid = ctx.ginfo.uid;
        var res = yield _pie.renamePieCo(uid, orgName, newName);

        ctx.body = __newMsg(0, 'OK');
        ctx.apiRes = res;
        return ctx;
    });
    return co;
};

/*重命名pie的函数
只能重命名自己的pie
*/
_pie.renamePieCo = renamePieCo;

function renamePieCo(uid, orgName, newName) {
    var co = $co(function* () {
        //先检查是否存在
        var ppath = uid + '/' + orgName;
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', ppath);
        if (!pid) throw Error('The pie do not exists.');

        //修改pie.name和_map:pie.path:pie.id键
        var mu = _rds.cli.multi();
        mu.hset('pie-' + pid, 'name', newName);
        mu.zadd('_map:pie.path:pie.id', pid, uid + '/' + newName);
        mu.zrem('_map:pie.path:pie.id', uid + '/' + orgName);
        var res = yield _ctnu([mu, 'exec']);
        return res;
    });
    return co;
};


//导出模块
module.exports = _pie;
