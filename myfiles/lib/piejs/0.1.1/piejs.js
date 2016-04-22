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

    //启动socketio
    var sktio = piejs.sktio = soketio.connect(window.location.host);
    sktio.on('checkin', function (msg) {
        console.log('Connect to jscodepie skts:', msg);
    });


    //从地址栏获取参数
    piejs.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };

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
