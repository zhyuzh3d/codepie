/*jscodepie官方web函数库
推荐每个pie都调用
 */

require.config({
    paths: {
        soketio: '//' + window.location.host + '/lib/socket.io/1.4.5/socket.io.min',
    },
});

define(['soketio'], function (soketio) {
    var piejs = {};

    //从地址栏获取参数
    piejs.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

    //启动socketio,获取自身sid后执行afterCheckin队列的函数
    var sktio = piejs.sktio = soketio.connect(window.location.host);
    sktio.afterCheckin = [];

    sktio.on('checkin', function (msg) {
        console.log('Connect to jscodepie skts:', msg);
        if (msg.data.sid) {
            sktio.sktinfo = msg.data;
            var fns = sktio.afterCheckin;
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
            console.log('Skt checkin failed:', msg);
        };
    });

    //本地服务监听接口分发路由
    piejs.sktApis = {};
    piejs.sktParty = [];
    sktio.on('transSmsg', function (data) {
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
    });

    //从属端盒party相关接口设置
    var setSktForParty = function () {
        //预览页如果地址栏带有partySid，那么立即发送sktid到这个地址
        var esid = piejs.getUrlParam('partySid');
        if (esid) {
            var dat = {
                tarSid: esid,
                tarApi: '_joinParty',
                sn: Number(new Date()),
            };
            sktio.emit('transSmsg', dat);
        };

        //如果地址栏有autoCmd那么将自动执行party发来的命令
        var autoCmd = piejs.getUrlParam('autoCmd');
        if (autoCmd == 'true') {
            piejs.sktApis._runCmd = function (msg) {
                //来源sid一定来自partyid才会被执行
                var frmsid = msg.data.from.sid;
                if (frmsid != esid) throw Error('Illegal cmd source.');
                eval(msg.data.data.cmd);
            };
        };

        //添加管理所有从属端的接口
        piejs.sktApis._joinParty = function (msg) {
            var frominfo = (msg.data) ? msg.data.from : undefined;
            var sid = (frominfo) ? frominfo.sid : undefined;
            if (!sid) throw Error('Socket id undefined.');

            //将从属端sktid放入队列
            if (piejs.sktParty.indexOf(sid) == -1) {
                piejs.sktParty.push(sid);
            };
        };

        //接收服务端返回的端口已经关闭的错误
        piejs.sktio.on('transErr', function (data) {
            try {
                switch (data.code) {
                case 0: //普通错误
                    console.log('Trans socket msg failed:' + data.text, data);
                    break;
                case -1: //目标skt不在线,从party里面去除
                    var pos = piejs.sktParty.indexOf(data.data.tarSid);
                    if (pos != -1) {
                        piejs.sktParty.splice(pos, 1);
                    };
                    console.log('misstar remove one', piejs.sktParty);
                    break;
                default:
                    break;
                };
            } catch (err) {
                console.log('Trans sktMsg error handler failed:', err);
            }
        });
    }();







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

    return piejs;
});
