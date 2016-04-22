/*sktio转发机制
 */

var _skt = {};

//启动监听
_skt.start = startFn;

function startFn(skt) {
    //检查合法性

    //中间件处理

    //存储skt,分别rds存储map到uid和pid（两个hash），便于匹配
    var sid = skt.id;
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
        var apinm = api;
        var apifn = sktapis[apinm];
        skt.on(api, function (data) {
            apifn(skt, data);
        });
    };

    //发送欢迎信息
    skt.emit('checkin', __newMsg(0, 'Welcome to jscodepie skts!', {
        sid: sid,
        uid: uid,
        pid: pid,
    }));
};


/*所有skt接口类型,格式*function(skt,smsg);
 */

var sktapis = {};


/*转发smsg，两个skt之间通信
要向一个skt发送信息，必须先拿到它的sktid才可以，参照下面的接口
{from:sktid,tar:sktid,sn:1234222,key:'...',msg:{code:1,text:'..',data:{}}}
*/
sktapis.transSmsg = transSmsg;

function transSmsg(skt, data) {
    //格式检查与获取数据
    if (!data) {
        skt.emit('transSmsg', __newMsg(0, 'Data can not be undefined.', data));
        return;
    };

    var tarsid = data.tar;
    if (!tarsid) {
        skt.emit('transSmsg', __newMsg(0, 'Target socket can not be undefined.', data));
        return;
    };

    var tarskt = _app.sktSvr.sockets.connected[tarsid];
    if (!tarskt) {
        skt.emit('transSmsg', __newMsg(0, 'Target missing', data));
        return;
    };

    //向目标转发消息,强力将from转化为对象，写入uid,pid,sid
    data.from = {
        sid: skt.id,
        uid: skt.uid,
        pid: skt.pid,
    };
    tarskt.emit('transSmsg', __newMsg(1, 'OK', data));
};

/*通过uid获取对应的多个skt
{uid:32}
 */
sktapis.getSktsByUid = getSktsByUid;

function getSktsByUid(skt, data) {
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
    var co = $co(function* () {
        var skts = yield _ctnu([_rds.cli, 'zrangebyscore'], '_map:sktid:usr.id', uid, uid);

        //去除已经断开链接的skts
        var sktsol = [];
        for (var i = 0; i < skts.length; i++) {
            var sktid = skts[i];
            if (_app.sktSvr.sockets.connected[sktid]) {
                sktsol.push(sktid);
            } else {
                _rds.cli.zrem('_map:sktid:usr.id', sktid);
            };
        };

        skt.emit('getSktsByUid', __newMsg(1, 'OK', {
            skts: sktsol,
        }));

        return sktsol;
    }).then(null, function (err) {
        skt.emit('getSktsByUid', __newMsg(0, err.message, data));
    });
};





//通过pid获取对应的多个skt,仅限pid作者调用


//通过uid和pieid获取对应的多个skt


//通过usr.mail获取uid


//通过pie.name获取pid




//导出模块
module.exports = _skt;
