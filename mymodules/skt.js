/*sktio转发机制
基于sktPath转发，uid/pid
 */

var _skt = {};

//启动监听
_skt.start = startFn;

function startFn(skt) {
    $co(function* () {
        //检查合法性

        //中间件处理

        //存储skt,分别rds存储map到uid和pid（两个hash），便于匹配
        var sid = skt.conn.id;
        var ck = $cookie.parse(skt.request.headers.cookie);

        //提取skt存储的数据
        var ukey = skt.ukey = ck.ukey;
        var ginfo = _pie.getPinfoByUrl(skt.request.headers.referer);
        var pname = ginfo.pname;
        var puid = ginfo.puid;
        if (!pname || !puid) throw Error('Pie app missing.');

        //从数据库读取uid和pid
        var mu = _rds.cli.multi();
        mu.zscore('_map:usr.ukey:usr.id', ukey);
        mu.zscore('_map:pie.name:pie.id', pname);
        var resarr = yield _ctnu([mu, 'exec']);
        var uid = resarr[0];
        if (!uid) throw Error('Can not get usr id.');
        var pid = resarr[1];
        if (!pid) throw Error('Can not get pie id.');

        //记录到skt以备使用，每个skt都有这三个id
        skt.sid = sid;
        skt.uid = uid;
        skt.pid = pid;

        //写入数据库
        _rds.cli.zadd('_map:skt.id:usr.id', uid, sid);
        _rds.cli.zadd('_map:skt.id:pie.id', pid, sid);
        _rds.cli.hset('_map:skt.path:skt.id', uid + '/' + pid, sid);
        //console.log('>>add a sktid', sid, uid, pid, pname);

        //断开时删除rds数据库
        skt.on('disconnect', function () {
            clearSktRds(sid).then(null, __errhdlr);
        });

        //接口处理
        for (var api in sktapis) {
            skt.on(api, sktapis[api]);
        };

        //发送欢迎信息
        skt.emit('_checkin', __newMsg(1, 'Welcome to jscodepie skts!', {
            sid: sid,
            uid: uid,
            pid: pid,
        }));
    }).then(null, function (err) {
        skt.emit('_checkin', __newMsg(0, err));
    });
};

/*清理断开的skt数据,如果没有uidpid那么自动读取*/
function clearSktRds(sid, uid, pid) {
    var co = $co(function* () {
        if (!uid) uid = yield _ctnu([_rds.cli, 'zscore'], '_map:skt.id:usr.id', sid);
        if (!pid) pid = yield _ctnu([_rds.cli, 'zscore'], '_map:skt.id:pie.id', sid);

        var mu = _rds.cli.multi();
        mu.hdel('_map:skt.path:skt.id', uid + '/' + pid);
        mu.zrem('_map:skt.id:usr.id', sid);
        mu.zrem('_map:skt.id:pie.id', sid);
        mu.exec();
        //console.log('>>del a sktid', sid, uid, pid);
    });
    return co;
};



/*所有skt接口类型,格式function(skt,smsg),返回一个function(data)函数;
 */
var sktapis = {};


/*转发smsg，两个skt之间通信
要向一个skt发送信息，必须先拿到它的sktid才可以，参照下面的接口
{tar:{sid:'xxx',uid:12,pid:125},api:'...',time:1234222,id:'...',msg:{code:1,text:'..',data:{}}}
*/
sktapis.transSmsg = transSmsg;

function transSmsg(data) {
    var skt = this;

    $co(function* () {
        //格式检查与获取数据
        if (!data) throw Error('Data can not be undefined:');

        //如果可以根据sid找到skt，那么直接使用，否则根据uid和pid获取skt
        var sinfo = data.tar;
        if (!sinfo.sid && (!sinfo.uid || !sinfo.pid)) throw Error('Target info format err.')

        var tarskt = _app.sktSvr.sockets.connected['/#' + sinfo.sid];
        if (!tarskt) {
            //尝试用uid和pid获取skt
            sinfo = yield getSktByUidPidCo(sinfo.uid, sinfo.pid);
            tarskt = _app.sktSvr.sockets.connected['/#' + sinfo.sid];
        };

        //仍然找不到skt（已经彻底离线），那么发送离线错误
        if (!tarskt) {
            skt.emit('setSktOffline', __newMsg(1, 'OK', data));
            throw Error('Target missing');
        };

        //如果获取的sid已经改变（从属端已经短线重连），那么发送信息告知客户端更新sktinfo
        if (tarskt.sid != sinfo.sid) {
            data.tar.sid = tarskt.sid;
            skt.emit('updateSktInfo', __newMsg(1, 'OK', data));
        };

        //向目标转发消息,强力将from转化为对象，写入uid,pid,sid
        data.from = {
            sid: skt.sid,
            uid: skt.uid,
            pid: skt.pid,
        };
        tarskt.emit('transSmsg', __newMsg(1, 'OK', data));
        return data;
    }).then(null, function (err) {
        skt.emit('transErr', __newMsg(0, err, data));
    })
};

/*通过uid获取对应的多个skt
{uid:32}
{skts:[]}
 */
_rotr.apis.getSktsByUid = function () {
    var ctx = this;
    var co = $co(function* () {
        //格式检查与获取数据
        var tuid = ctx.query.uid || ctx.request.body.uid;
        if (!tuid || !_cfg.regx.int.test(tuid)) throw Error('User id format err.');

        //读取数据
        var skts = yield getSktsByUidCo(tuid);
        ctx.body = __newMsg(1, 'OK', {
            skts: skts
        });
        return ctx;
    });
    return co;
};

/*获取uid对应的再现skts*/
function getSktsByUidCo(uid) {
    var co = $co(function* () {
        var skts = yield _ctnu([_rds.cli, 'zrangebyscore'], '_map:skt.id:usr.id', uid, uid);

        //去除已经断开链接的skts
        var sktsol = [];
        for (var i = 0; i < skts.length; i++) {
            var skt = _app.sktSvr.sockets.connected['/#' + skts[i]];
            if (skt) {
                var sktinfo = {
                    sid: skt.sid,
                    uid: skt.uid,
                    pid: skt.pid,
                };
                sktsol.push(sktinfo);
            } else {
                yield clearSktRds(skts[i]);
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
_rotr.apis.getSktsByPid = function () {
    var ctx = this;
    var co = $co(function* () {
        //格式检查与获取数据
        var pid = ctx.query.pid || ctx.request.body.pid;
        if (!pid || !_cfg.regx.int.test(pid)) throw Error('App id format err.');

        //检查是否管理员或者pie的author
        var authorid = yield _ctnu([_rds.cli, 'hget'], 'pie-' + pid, 'uid');
        if (!authorid) throw Error('Cant find the app.');
        var uid = ctx.ginfo.uid;
        if (uid != authorid && uid != 1) throw Error('Permission denied.');

        //读取数据
        var skts = yield getSktsByPidCo(pid);
        ctx.body = __newMsg(1, 'OK', {
            skts: skts
        });
        return ctx;
    });
    return co;
};

/*获取pid对应的再现skts
 */
function getSktsByPidCo(pid) {
    var co = $co(function* () {
        var skts = yield _ctnu([_rds.cli, 'zrangebyscore'], '_map:skt.id:pie.id', pid, pid);

        //去除已经断开链接的skts
        var sktsol = [];
        for (var i = 0; i < skts.length; i++) {
            var sktid = skts[i];
            var skt = _app.sktSvr.sockets.connected['/#' + sktid];
            if (skt) {
                var sktinfo = {
                    sid: skt.sid,
                    uid: skt.uid,
                    pid: skt.pid,
                };
                sktsol.push(sktinfo);
            } else {
                yield clearSktRds(sktid);
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
_rotr.apis.getSktsByUidPid = function () {
    var ctx = this;
    var co = $co(function* () {
        //格式检查与获取数据
        var tpid = ctx.query.pid || ctx.request.body.pid;
        if (!tpid || !_cfg.regx.int.test(tpid)) throw Error('App id format err.');

        var tuid = ctx.query.uid || ctx.request.body.uid;
        if (!tuid || !_cfg.regx.int.test(tuid)) throw Error('Usr id format err.');

        //返回数据
        var okskts = yield getSktsByUidPidCo(tuid, tpid);
        ctx.body = __newMsg(1, 'OK', {
            skts: okskts
        });
        return ctx;
    });
    return co;
};

/*根据uid和pid获取交叉的多个sktid
读取uid对应的所有sktid，逐个检查是否与pie匹配
 */
function getSktsByUidPidCo(uid, pid) {
    var co = $co(function* () {
        var uskts = yield getSktsByUidCo(uid);
        var mu = _rds.cli.multi();
        for (var i = 0; i < uskts.length; i++) {
            mu.zscore('_map:skt.id:pie.id', uskts[i].sid);
        };
        var res = yield _ctnu([mu, 'exec']);
        var okskts = [];
        for (var n = 0; n < res.length; n++) {
            if (res[n] == pid && n < uskts.length) {
                var skt = _app.sktSvr.sockets.connected['/#' + uskts[n].sid];
                if (skt) {
                    var sktinfo = {
                        sid: skt.sid,
                        uid: skt.uid,
                        pid: skt.pid,
                    };
                    okskts.push(sktinfo);
                } else {
                    yield clearSktRds(uskts[n]);
                };
            };
        };
        return okskts;
    });
    return co;
};




/*通过uid和pieid获取对应的单个skt
这是getSktsByUidPid的快捷版本，只获取最新的一个uid/pid对应的sktid
{uid:1,pid:4}
{sid:1,uid:23,pid:44}
*/
_rotr.apis.getSktByUidPid = function () {
    var ctx = this;
    var co = $co(function* () {
        //格式检查与获取数据
        var tpid = ctx.query.pid || ctx.request.body.pid;
        if (!tpid || !_cfg.regx.int.test(tpid)) throw Error('App id format err.');

        var tuid = ctx.query.uid || ctx.request.body.uid;
        if (!tuid || !_cfg.regx.int.test(tuid)) throw Error('Usr id format err.');

        //返回数据
        var sktinfo = yield getSktByUidPidCo(tuid, tpid);
        if (!sktinfo.sid) throw Error('No data.');
        ctx.body = __newMsg(1, 'OK', sktinfo);
        return ctx;
    });
    return co;
};

/*根据uid和pid获取最新的单个skt
 */
function getSktByUidPidCo(uid, pid) {
    var co = $co(function* () {
        var sktid = yield _ctnu([_rds.cli, 'hget'], '_map:skt.path:skt.id', uid + '/' + pid);
        var skt = _app.sktSvr.sockets.connected['/#' + sktid];
        if (skt) {
            var sktinfo = {
                sid: skt.sid,
                uid: skt.uid,
                pid: skt.pid,
            }
            return sktinfo;
        } else {
            yield clearSktRds(sktid);
            return undefined;
        };
    });
    return co;
};







//导出模块
module.exports = _skt;
