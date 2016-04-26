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
        //检查用户是否已经存在同名的pieapp,先获取pieSetKey(如果没有自动创建)，然后检查是否存在
        var usrkey = 'usr-' + uid;
        var setkey = yield _ctnu([_rds.cli, 'hget'], usrkey, 'pieSetKey');
        if (setkey) {
            var exist = yield _ctnu([_rds.cli, 'sismember'], setkey, name);
            if (exist) {
                throw Error('The pie name [' + name + '] already  exists.')
            };
        } else {
            //如果usr还没有pieSetKey那么自动创建并加入usr
            var setid = yield _ctnu([_rds.cli, 'zincrby'], '_cls', 1, 'set');
            setkey = 'set-' + setid;
            yield _ctnu([_rds.cli, 'hset'], usrkey, 'pieSetKey', setkey);
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

        //存入pieset列表
        mu.sadd(setkey, name);

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



/*获取我的pie列表
req:{}
res:{count:12,pies:[{id:13,name:'..',url:'...'}]}
*/
_rotr.apis.getPieList = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;
        var res = yield getPieListCo(uid);
        ctx.body = __newMsg(1, 'OK', res);
        ctx.xdat.getPieList = res;
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
        if (!setkey) throw Error('You have not create one pie.');
        var pies = yield _ctnu([_rds.cli, 'smembers'], setkey);
        if (!pies || pies.length < 1) throw Error('Your pie box is empty.');

        //逐个读取pid
        var mu = _rds.cli.multi();
        for (var i in pies) {
            var pkey = uid + '/' + pies[i];
            mu.zscore('_map:pie.name:pie.id', pkey);
        }
        var pidarr = yield _ctnu([mu, 'exec']);

        //逐个读取pie信息
        for (var i in pidarr) {
            var pkey = 'pie-' + pidarr[i];
            mu.hgetall(pkey);
        }
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
        var uid = ctx.xdat.uid;

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
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', piename);
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



/*使用pieUid和pieName获取pie的基本信息，如作者、js路径、pieId等
这些信息都是公开的，因此可以获取其他人的pie信息
req:{uid:12,name:'...'},authorId为空默认值为自己的uid
res:{id:12,name:'...',uid:12,url:'...',power:'...'}
*/
_rotr.apis.getPieInfoByPuidPnm = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var name = ctx.query.name || ctx.request.body.name;
        if (!name || !_cfg.regx.pieName.test(name)) throw Error('Pie name format error.');

        var authid = ctx.query.uid || ctx.request.body.uid;
        if (authid && !_cfg.regx.int.test(authid)) throw Error('Author ID format error.');
        if (!authid) authid = uid;

        //找到pid
        var piename = authid + '/' + name;
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', piename);
        if (!pid) throw Error('Can not find the pie id [' + pname + ']');

        var res = yield getPieInfoByPidCo(pid);
        res.power = (res.uid == uid) ? 'author' : 'usr';
        ctx.body = __newMsg(1, 'OK', res);
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
        var uid = ctx.xdat.uid;

        var thepid = ctx.query.id || ctx.request.body.id;
        if (!thepid || !_cfg.regx.int.test(thepid)) throw Error('Pie id format error.');

        var res = yield getPieInfoByPidCo(thepid);
        //加入权限写入
        res.power = (res.uid == uid) ? 'author' : 'usr';
        ctx.body = __newMsg(1, 'OK', res);
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
        var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', piename);
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







//导出模块
module.exports = _pie;
