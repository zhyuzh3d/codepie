/*jscodepie官方web函数库
推荐每个pie都调用
 */

require.config({
    paths: {
        jquery: '//' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        soketio: '//' + window.location.host + '/lib/socket.io/1.4.5/socket.io.min',
    },
});

define(['jquery', 'soketio'], function ($, soketio) {
    var piejs = {};

    //用户power权限
    piejs.usrPower = {
        unkown: 0, //未知
        usr: 10, //普通用户
        member: 20, //使用成员
        manager: 30, //使用成员的管理者
        partner: 40, //联合开发者
        author: 50, //作者开发者
        service: 60, //网站客服
        admin: 70, //网站管理员
        boss: 100, //网站最高管理员
    };

    //从地址栏获取参数
    piejs.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    //从页面dom获取gkey
    piejs.pageKey = $('codepie').attr('gkey');


    //生成非重复的字符串序号,时间戳加随机数
    piejs.uniqueId = uniqueId;

    function uniqueId(prefix) {
        var ts = Number(new Date()).toString(36)
        var rd = Number(String(Math.random()).replace('.', '')).toString(36);
        var res = ts + '-' + rd;
        if (prefix) res = prefix + '-' + res;
        return res;
    };

    /*生成标准的msg*/
    piejs.newMsg = __newMsg;

    function __newMsg(code, text, data) {
        if (text.constructor == Array) {
            text = text.join(' ');
        };
        return {
            code: code,
            text: text,
            data: data,
            time: Number(new Date()),
        };
    };

    /*生成skt的msg，在msg基础上增加一个id,这个id自动生成或最后指定
    {1,'ok',data,'...'}*/
    piejs.__newSmsg = __newSmsg;

    function __newSmsg(code, text, data, id) {
        if (text.constructor == Array) {
            text = text.join(' ');
        };
        if (!id) id = uniqueId();
        return {
            id: id,
            code: code,
            text: text,
            data: data,
            time: Number(new Date()),
        };
    };



    //以下skt相关------
    //启动socketio,获取自身sid后执行afterCheckin队列的函数
    var sktio = piejs.sktio = soketio.connect(window.location.host);
    sktio.afterCheckinFnArr = [];
    sktio.sktInfo = [];


    /*设置skt回调函数;将fn放入sktCallBackFns［smsmg.id］,以备sktCallBack调用
    fn的格式function(recvSmsg,sendSmsg){return false};返回true阻止默认处理
     */
    piejs.addSktCb = addSktCb;
    piejs.sktCallBackFns = {};
    piejs.sktSmsgs = {};

    function addSktCb(smsg, cbfn) {
        if (!smsg || !smsg.id) {
            console.log('piejs.setSktCb failed:id can not be undefined.', smsg);
            return;
        };
        if (!cbfn || cbfn.constructor != Function) {
            console.log('piejs.setSktCb failed:callback function can not be undefined.', smsg);
            return;
        };
        piejs.sktCallBackFns[smsg.id] = cbfn;
        piejs.sktSmsgs[smsg.id] = smsg;
    };

    /*清理skt回调*/
    piejs.delSktCb = delSktCb;

    function delSktCb(id) {
        if (!id) return;
        delete piejs.sktCallBackFns[id];
        delete piejs.sktSmsgs[id];
    };

    /*检查是否有sktcbfn可以执行;用来放在skt.on中最先执行检查
    cbfn返回true那么skt.on监听就直接return；否则继续往下执行默认的命令
    */
    piejs.doSktCb = doSktCb;

    function doSktCb(smsg) {
        if (!smsg || !smsg.id) return false;
        var fn = piejs.sktCallBackFns[smsg.id];
        if (!fn || fn.constructor != Function) return false;
        try {
            res = fn(smsg, piejs.sktSmsgs[smsg.id]);
            return res;
        } catch (err) {
            console.log('piejs.sktCallback failed:', err, smsg);
            return false;
        };
    };


    //首次链接返回信息处理
    sktio.on('_checkin', sktCheckin);

    function sktCheckin(msg) {
        console.log('Connect to jscodepie skts:', msg);
        if (msg.data.sid) {
            sktio.sktInfo = msg.data;
            var fns = sktio.afterCheckinFnArr;
            if (fns && fns.constructor == Array) {
                for (var n = 0; n < fns.length; n++) {
                    var fn = fns[n];
                    if (fn.constructor == Function) {
                        try {
                            fn(msg.data);
                        } catch (err) {
                            console.log('afterCheckin function err:' + err);
                        };
                    };
                };
            };
        } else {
            console.log('Skt _checkin failed:', msg);
        };
    };

    //本地服务监听接口分发路由
    piejs.sktApis = {};
    piejs.sktFamily = {};
    sktio.on('transSmsg', sktTransSmsg);

    function sktTransSmsg(data) {
        var api = (data.data) ? data.data.tarApi : undefined;
        if (api) {
            var handler = piejs.sktApis[api];
            if (handler && handler.constructor == Function) {
                try {
                    handler(data);
                } catch (err) {
                    console.log('Skt Api [' + api + '] err:', err)
                };
            };
        } else {
            console.log('Skt api can not undefined.');
        };
    };

    //接收服务端返回的端口已经关闭的错误
    piejs.sktio.on('transErr', sktTransErr);

    function sktTransErr(data) {
        //如果有自定义的捕获函数，则使用它
        if (piejs.sktTransErrFn && piejs.sktTransErrFn.constructor == Function) {
            try {
                piejs.sktTransErrFn(data);
            } catch (err) {
                console.log('Custom transErrFn failed:', err);
            };
            return;
        };
        try {
            switch (data.code) {
            case 1:
                break;
            case -1:
                //目标skt不在线,标记它断开
                var sktinfo = piejs.sktFamily[data.data.tarSid];
                if (sktinfo) sktinfo.state == -1;
                break;
            default:
                console.log('Trans socket msg failed:' + data.text, data);
                break;
            };
        } catch (err) {
            console.log('Trans sktMsg error handler failed:', err);
        };
    };

    //添加管理所有从属端的接口
    piejs.sktApis._joinFamily = skt_joinFamily;

    function skt_joinFamily(msg) {
        if (piejs.doSktCb(msg.data) == true) return;
        var frominfo = (msg.data) ? msg.data.from : undefined;
        var fsid = (frominfo) ? frominfo.sid : undefined;
        if (!fsid) throw Error('Socket id undefined.');

        //将从属端sktid放入队列
        piejs.sktFamily[fsid] = msg.data.from;

        //返回欢迎信息
        var dt = {
            tarSid: frominfo.sid,
            tarApi: '_joinFamily',
            time: Number(new Date()),
            id: msg.data.id,
            data: __newMsg(1, 'Welcome to join skt family:' + sktio.sktInfo.sid),
        };
        sktio.emit('transSmsg', dt);
    };


    //从属端family相关接口设置
    var autoJoinSktFamily = function () {
        //预览页如果地址栏带有parentSid，那么立即发送sktid到这个地址
        //预览页如果地址栏带有parentUid和parentPid，那么立即获取skt并发送sktid到这个地址
        var tsid = piejs.getUrlParam('parentSid');
        var tuid = piejs.getUrlParam('parentUid');
        var tpid = piejs.getUrlParam('parentPid');
        if (!tsid && (!tuid || !tpid)) return;
        if (tsid) {
            joinParentSktFamilyBySid(tsid);
        } else if (tuid && tpid) {
            $.post('http://' + window.location.host + '/api/getSktByUidPid', {
                uid: tuid,
                pid: tpid
            }, function (data) {
                if (data.code == 1) {
                    tsid = data.data.sid;
                    joinParentSktFamilyBySid(tsid);
                } else {
                    console.log('>Join skt family failed:', data.text);
                };
            });
        };

        //启动等待父层skt命令的监听
        var autoCmd = piejs.getUrlParam('autoCmd');
        if (autoCmd == 'true') {
            piejs.sktApis._runCmd = function (msg) {
                if (piejs.doSktCb(msg.data) == true) return;
                var frmsid = msg.data.from.sid;
                if (!tsid) throw ('Parent skt can not be undefined.');
                if (frmsid != tsid) throw Error('Illegal cmd source.');
                eval(msg.data.data.cmd);
            };
        };
    }();

    //获得父层skt并发送skt信息加入父层的family
    function joinParentSktFamilyBySid(sid) {
        if (!sid) return;
        var dt = {
            tarSid: sid,
            tarApi: '_joinFamily',
            time: Number(new Date()),
            id: piejs.uniqueId(),
        };
        sktio.emit('transSmsg', dt);
        piejs.addSktCb(dt, function (res, dat) {
            console.log(res.data.text);
            piejs.delSktCb(res.id);
            return true;
        });
    };









    return piejs;
});
