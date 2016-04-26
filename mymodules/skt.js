/*sktio转发机制
 */

var _skt = {};

//启动监听
_skt.start = startFn;

function startFn(skt) {
    //检查合法性

    //中间件处理

    //存储skt,分别rds存储map到uid和pid（两个hash），便于匹配
    var sid = skt.conn.id;
    var ck = $cookie.parse(skt.request.headers.cookie);

    //提取skt存储的数据
    var uid = skt.uid = ck.uid;
    var pid = skt.pid = ck.pid;

    if (!uid || !pid) {
        //异常请求，直接返回错误并结束
        skt.emit('checkin', __newMsg(0, 'Socket msg data err.'));
        return;
    };
    _rds.cli.zadd('_map:sktid:usr.id', uid, sid);
    _rds.cli.zadd('_map:sktid:pie.id', pid, sid);

    //断开时删除rds数据库
    skt.on('disconnect', function () {
        _rds.cli.zrem('_map:sktid:usr.id', sid);
        _rds.cli.zrem('_map:sktid:pie.id', sid);
    });


    //接口处理
    for (var api in sktapis) {
        skt.on(api, sktapis[api]);
    };

    //发送欢迎信息
    skt.emit('checkin', __newMsg(1, 'Welcome to jscodepie skts!', {
        sid: sid,
        uid: uid,
        pid: pid,
    }));
};


/*所有skt接口类型,格式function(skt,smsg),返回一个function(data)函数;
 */
var sktapis = {};


/*转发smsg，两个skt之间通信
要向一个skt发送信息，必须先拿到它的sktid才可以，参照下面的接口
{tarSid:sktid,tarApi:'...',sn:1234222,key:'...',msg:{code:1,text:'..',data:{}}}
*/
sktapis.transSmsg = transSmsg;

function transSmsg(data) {
    var skt = this;

    //格式检查与获取数据
    if (!data) {
        skt.emit('transErr', __newMsg(0, 'Data can not be undefined.', data));
        return;
    };

    var tarsid = data.tarSid;
    if (!tarsid) {
        skt.emit('transErr', __newMsg(0, 'Target socket can not be undefined.', data));
        return;
    };

    var tarskt = _app.sktSvr.sockets.connected['/#' + tarsid];
    if (!tarskt) {
        skt.emit('transErr', __newMsg(-1, 'Target missing', data));
        return;
    };

    //向目标转发消息,强力将from转化为对象，写入uid,pid,sid
    data.from = {
        sid: skt.conn.id,
        uid: skt.uid,
        pid: skt.pid,
    };
    tarskt.emit('transSmsg', __newMsg(1, 'OK', data));
};

/*通过uid获取对应的多个skt
{uid:32}
{skts:[]}
 */
sktapis.getSktsByUid = getSktsByUid;

function getSktsByUid(data) {
    var skt = this;
    //格式检查与获取数据
    if (!data) {
        skt.emit('getSktsByUid', __newMsg(0, 'Data can not be undefined.', data));
        return;
    };

    var uid = (data) ? data.uid : undefined;
    if (!uid || !_cfg.regx.int.test(uid)) {
        skt.emit('getSktsByUid', __newMsg(0, 'User id format err.', data));
        return;
    };

    //读取数据库
    $co(function* () {
        var skts = yield getSktsByUidCo(skt, uid);
        skt.emit('getSktsByUid', __newMsg(1, 'OK', {
            skts: skts,
        }));
    }).then(null, function (err) {
        skt.emit('getSktsByUid', __newMsg(0, err.message, data));
    });
};

/*获取uid对应的再现skts*/
function getSktsByUidCo(skt, uid) {
    var co = $co(function* () {
        var skts = yield _ctnu([_rds.cli, 'zrangebyscore'], '_map:sktid:usr.id', uid, uid);

        //去除已经断开链接的skts
        var sktsol = [];
        for (var i = 0; i < skts.length; i++) {
            var sktid = skts[i];
            if (_app.sktSvr.sockets.connected['/#' + sktid]) {
                sktsol.push(sktid);
            } else {
                _rds.cli.zrem('_map:sktid:usr.id', sktid);
            };
        };
        return sktsol;
    });
    return co;
};

/*通过pid获取对应的多个skt,仅限pid作者调用
{pid:4}
{skts:[]}
 */
sktapis.getSktsByPid = getSktsByPid;

function getSktsByPid(data) {
    var skt = this;
    //格式检查与获取数据
    if (!data) {
        skt.emit('getSktsByPid', __newMsg(0, 'Data can not be undefined.', data));
        return;
    };

    var pid = (data) ? data.pid : undefined;
    if (!pid || !_cfg.regx.int.test(pid)) {
        skt.emit('getSktsByPid', __newMsg(0, 'App id format err.', data));
        return;
    };

    $co(function* () {
        //检查是否管理员或者pie的author
        var authorid = yield _ctnu([_rds.cli, 'hget'], 'pie-' + pid, 'uid');
        if (!authorid) throw Error('Cant find the app.');
        if (!skt.uid) throw Error('You have not checkin.');
        if (skt.uid != authorid && skt.id != 1) throw Error('Permission denied.');

        //读取数据
        var skts = yield getSktsByPidCo(skt, pid);
        skt.emit('getSktsByPid', __newMsg(1, 'OK', {
            skts: skts,
        }));
        return skts;
    }).then(null, function (err) {
        skt.emit('getSktsByPid', __newMsg(0, err.message, data));
    });
};

/*获取pid对应的再现skts
 */
function getSktsByPidCo(skt, pid) {
    var co = $co(function* () {
        var skts = yield _ctnu([_rds.cli, 'zrangebyscore'], '_map:sktid:pie.id', pid, pid);

        //去除已经断开链接的skts
        var sktsol = [];
        for (var i = 0; i < skts.length; i++) {
            var sktid = skts[i];
            if (_app.sktSvr.sockets.connected['/#' + sktid]) {
                sktsol.push(sktid);
            } else {
                _rds.cli.zrem('_map:sktid:pie.id', sktid);
            };
        };
        return sktsol;
    });
    return co;
};

/*通过uid和pieid获取对应的多个skt
{uid:1,pid:4}
{skts:[]}
*/
sktapis.getSktsByUidPid = getSktsByUidPid;

function getSktsByUidPid(data) {
    var skt = this;
    //格式检查与获取数据
    if (!data) {
        skt.emit('getSktsByUidPid', __newMsg(0, 'Data can not be undefined.', data));
        return;
    };
    var pid = (data) ? data.pid : undefined;
    if (!pid || !_cfg.regx.int.test(pid)) {
        skt.emit('getSktsByUidPid', __newMsg(0, 'App id format err.', data));
        return;
    };
    var uid = (data) ? data.uid : undefined;
    if (!uid || !_cfg.regx.int.test(uid)) {
        skt.emit('getSktsByUidPid', __newMsg(0, 'User id format err.', data));
        return;
    };

    //先获取uid打开的所有skts，然后逐个检查每个skt对应的pid是否与pid相同
    $co(function* () {
        var uskts = yield getSktsByUidCo(skt, uid);
        var mu = _rds.cli.multi();
        for (var i = 0; i < uskts.length; i++) {
            var sktnm = uskts[i];
            mu.zscore('_map:sktid:pie.id', sktnm);
        };
        var res = yield _ctnu([mu, 'exec']);
        var okskts = [];
        for (var n = 0; n < res.length; n++) {
            if (res[n] == pid && n < uskts.length) {
                okskts.push(uskts[n]);
            };
        };
        skt.emit('getSktsByUidPid', __newMsg(1, 'OK', {
            skts: okskts,
        }));
        return okskts;
    }).then(null, function (err) {
        skt.emit('getSktsByUidPid', __newMsg(0, err.message, data));
    });
};






//导出模块
module.exports = _skt;
