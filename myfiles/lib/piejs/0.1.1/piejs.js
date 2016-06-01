/*jscodepie官方web函数库
推荐每个pie都调用
 */

require.config({
    paths: {
        jquery: '//' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        soketio: '//' + window.location.host + '/lib/socket.io/1.4.5/socket.io.min',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
    },
    map: {
        '*': {
            'css': 'http://' + window.location.host + '/lib/require-css/0.1.8/css.min.js',
        }
    },
    shim: {
        bootstrap: {
            deps: ['css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min.css',
                   'css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap-theme.min.css']
        },
        swal: {
            deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
        },
        toastr: {
            deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
        },
    },
});

define(['jquery', 'soketio', 'bootstrap', 'toastr', 'swal'],
    function ($, soketio, bootstrap, toastr, swal) {
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

        //常用正则表达式
        piejs.regx = {
            mail: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            code6: /^\d{6}$/, //6位数字
            intp: /^\d+$/, //正整数
            int: /^(-|\+)?\d+$/, //整数
            pw: /^[0-9a-z]{8,32}$/, //8位验证码或者32位hex
            nick: /^.{1,32}$/, //1～32位非回车
            sex: /^[012]{1}$/, //0,1,2
            pieName: /^[a-zA-Z\u0391-\uFFE5]+[0-9a-zA-Z\u0391-\uFFE5\.]{2,12}$/, //中英文至少3个字符，不能数字开头，可以有点
        };

        //从地址栏获取参数
        piejs.getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return decodeURI(r[2]);
            };
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
        var sktio = piejs.sktio = soketio.connect('http://' + location.host);
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

        piejs.sktio.hasCheckin = false;

        function sktCheckin(msg) {
            if (msg.data && msg.data.sid) {
                sktio.sktInfo = msg.data;
                console.log('Skt _checkin ok:', msg);
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
                piejs.sktio.hasCheckin = true;
            } else {
                console.log('Skt _checkin failed:', msg);
            };
        };

        //本地服务监听接口分发路由
        piejs.sktApis = {};
        sktio.on('transSmsg', sktTransSmsg);

        function sktTransSmsg(data) {
            var api = (data.data) ? data.data.api : undefined;
            console.log('>sktTransSmsg', api, data);
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
            console.log('>sktTransErr', data);
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
        piejs.sktFactory = {}; //factory[sktpath]=sktinfo
        piejs.sktFamily = []; //数组[sktpath,sktpath];
        piejs.sktApis._joinFamily = skt_joinFamily;

        function skt_joinFamily(msg) {
            if (piejs.doSktCb(msg.data) == true) return;
            var frominfo = (msg.data) ? msg.data.from : undefined;
            if (!frominfo) throw Error('Socket can not be undefined.');

            //将从属端sktid放入队列,设定为在线state=1
            var spath = frominfo.uid + '/' + frominfo.pid;
            frominfo.state = 1;
            piejs.sktFactory[spath] = frominfo;
            if (piejs.sktFamily.indexOf(spath) == -1) {
                piejs.sktFamily.push(spath);
            };
            console.log('>skt_joinFamily', piejs.sktFamily);

            //返回欢迎信息
            var dt = {
                tar: frominfo,
                api: '_joinFamily',
                time: Number(new Date()),
                id: msg.data.id,
                data: __newMsg(1, 'Welcome to join skt family:' + sktio.sktInfo.sid),
            };
            sktio.emit('transSmsg', dt);
        };

        //更新factory的skt的sid的接口,同时设置为在线state＝1
        piejs.sktio.on('updateSktInfo', updateSktInfo);

        function updateSktInfo(msg) {
            if (piejs.doSktCb(msg.data) == true) return;
            if (data.code == 1) {
                var tar = msg.data.tar;
                var spath = tar.uid + '/' + tar.pid;
                var sinfo = piejs.sktFactory[spath];
                tar.state = 1;
                if (sinfo) {
                    sinfo.sid = tar.sid;
                    sinfo.uid = tar.uid;
                    sinfo.pid = tar.pid;
                    sinfo.state = tar.state;
                } else {
                    piejs.sktFactory[spath] = tar;
                };
            } else {
                console.log('updateSktInfo failed:', msg.text);
            };
        };

        //设置factory的skt的state为离线的接口
        piejs.sktio.on('setSktOffline', setSktOffline);

        function setSktOffline(msg) {
            if (piejs.doSktCb(msg.data) == true) return;
            if (data.code == 1) {
                var tar = msg.data.tar;
                var spath = tar.uid + '/' + tar.pid;
                var sinfo = piejs.sktFactory[spath];
                if (sinfo) {
                    sinfo.state = -1;
                };
            } else {
                console.log('setSktOffline failed:', msg.text);
            };
        };



        //从属端family相关接口设置
        var autoJoinSktFamily = function () {
            //预览页如果地址栏带有parentSid，那么立即发送sktid到这个地址
            //预览页如果地址栏带有parentUid和parentPid，那么立即获取skt并发送sktid到这个地址
            var tsid = piejs.getUrlParam('parentSid');
            var tuid = piejs.getUrlParam('parentUid');
            var tpid = piejs.getUrlParam('parentPid');

            if (!tsid && (!tuid || !tpid)) return;
            var sinfo = {
                sid: tsid,
                uid: tuid,
                pid: tpid,
            };

            joinParentSktFamilyBySinfo(sinfo);

            //启动等待父层skt命令的监听
            var autoCmd = piejs.getUrlParam('autoCmd');
            if (autoCmd == 'true') {
                piejs.sktApis._runCmd = function (msg) {
                    if (piejs.doSktCb(msg.data) == true) return;
                    var frm = msg.data.from;
                    if (!tsid && (!tuid || !tpid)) throw ('Parent skt can not be undefined.');
                    if (frm.sid != tsid && (frm.uid != tuid && frm.pid != tpid)) throw Error('Illegal cmd source.');
                    eval(msg.data.data.cmd);
                };
            };
        }();

        //获得父层skt并发送skt信息加入父层的family
        function joinParentSktFamilyBySinfo(sinfo) {
            if (!sinfo) return;
            var dt = {
                tar: sinfo,
                api: '_joinFamily',
                time: Number(new Date()),
                id: piejs.uniqueId(),
            };
            console.log('>autoJoinSktFamily', dt);
            sktio.emit('transSmsg', dt);
            piejs.addSktCb(dt, function (res, dat) {
                console.log(res.data.text);
                piejs.delSktCb(res.id);
                return true;
            });
        };


        //上传数据存储为文件的函数
        //fns:{ing:fn(),ok:fn(res.data),err:fn(res)}
        //cfg:{uid:1,dat:'',key:'',pid:33},uid上传者，data数据，key存储路径，pid应用id
        function uploadDataToFile(cfgobj, fnsobj) {
            //只能上传到自己的目录
            if ((!cfgobj.uid || !cfgobj.file) && fnsobj.err && fnsobj.err.constructor == Function) {
                fnsobj.err({
                    code: 0,
                    text: '参数错误.'
                });
            };
            var ufolder = 'http://files.jscodepie.com/' + cfgobj.uid + '/';
            var fpath = ufolder + cfgobj.key;
            if (fnsobj.ing && fnsobj.ing.constructor == Function) {
                fnsobj.ing();
            };
            if (!cfgobj.data) cfgobj.data = '';

            var postdata = {
                data: cfgobj.data,
                file: cfgobj.file,
            };
            $.post("../api/uploadData", postdata, function (res) {
                if (res.code == 1 && fnsobj.ok && fnsobj.ok.constructor == Function) {
                    fnsobj.ok(res.data);
                };
                if (res.code != 1 && fnsobj.err && fnsobj.err.constructor == Function) {
                    fnsobj.ok(res);
                };
            });
        };
        piejs.uploadDataToFile = uploadDataToFile;
        piejs.uploadPreUrl = 'http://files.jscodepie.com/';


        //初始化pie的底部和顶部界面
        piejs.initPie = initPie;

        piejs.baseTop = undefined;
        piejs.baseBot = undefined;

        function initPie(part) {
            if (part == 'none') return;
            part = (!part) ? 'all' : part;
            if (part == 'bot' || part == 'all') piejs.baseBot = initPieBot();
            if (part == 'top' || part == 'all') {
                piejs.getUinfo(function (res) {
                    piejs.baseTop = initPieTop();
                }, function (res) {
                    toastr.error(res.text);
                });
            };
        };

        //界面颜色
        piejs.clr = {
            boybg: '#1cbbb4',
            boybdr: '#05aaa3',
            girlbg: '#f7449e',
            girlbdr: '#ea2588',
            lighter: '#EEE',
            light: '#DDD',
            midlight: '#AAA',
            midgray: '#888',
            dark: '#444',
        };

        //获取用户基本信息写到uinfo
        piejs.getUinfo = function (okfn, errfn) {
            var api = 'http://' + location.host + '/api/getMyProfile';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                if (res.code == 1) {
                    piejs.uinfo = res.data;
                    if (okfn && okfn.constructor == Function) okfn(res);
                } else {
                    if (errfn && errfn.constructor == Function) errfn(res);
                }
            });
        };

        //初始化pie的顶部信息
        function initPieTop() {
            var pbox = $('#pieBox');

            var pieUiGrp = $('<div id="_pieTopGrp" style="position:absolute;top:0;bottom:0;right:0;z-index:100"></div>').appendTo(pbox);

            var pieBall = pieUiGrp.ballbtn = $('<div></div>').appendTo(pieUiGrp);
            pieBall.css({
                'width': '2.5em',
                'height': '2.5em',
                'border-radius': '2em',
                'background-color': '#EEE',
                'border': '1px solid ' + piejs.clr.light,
                'margin': '0.75em',
                'position': 'absolute',
                'right': '0.5em',
                'text-align': 'center',
                'line-height': '2.5em',
                'overflow': 'hidden',
                'color': piejs.clr.dark,
                'cursor': 'pointer',
            });
            pieBall.html('P');

            var pieMenu = $('<ul></ul>').appendTo(pieUiGrp);
            pieMenu.css({
                'position': 'absolute',
                'top': '4em',
                'right': '1em',
                'width': '10em',
                'border': '1px solid #CCC',
                'background-color': '#FFF',
                'border-radius': '0.5em',
                'text-align': 'center',
                'box-shadow': '0 0 2em #CCC',
                'padding': '0',
                'text-align': 'center',
                'overflow': 'hidden'
            });

            var startmn = $('<li>我的首页</li>').appendTo(pieMenu);
            startmn.css({
                'list-style-type': 'none',
                'height': '3.5em',
                'cursor': 'pointer',
                'line-height': '3.5em',
            });
            startmn.hover()
            startmn.hover(function (e) {
                $(e.target).css({
                    'background-color': '#f0ffff'
                });
            }, function (e) {
                $(e.target).css({
                    'background-color': '#FFF'
                });
            });

            $('<hr style="margin:0">').appendTo(pieMenu);
            var setmn = startmn.clone(true, true).html('个人资料').appendTo(pieMenu);
            $('<hr style="margin:0">').appendTo(pieMenu);
            var quitmn = startmn.clone(true, true).html('退出账号').appendTo(pieMenu);

            //菜单功能
            startmn.click(function () {
                pieMenu.hide(200, function () {
                    location.href = 'http://' + window.location.host + '/app/start';
                });
            });
            setmn.click(function () {
                pieMenu.hide(200, function () {
                    location.href = 'http://' + window.location.host + '/app/login?tab=bindMail';
                });
            });
            quitmn.click(function () {
                //如果还没有绑定邮箱，弹出提示确认
                if (piejs.uinfo && !piejs.uinfo.mail) {
                    swal({
                        title: "危险！",
                        text: "您还没绑定邮箱，注销后临时账号将无法找回！",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#1cbbb4",
                        confirmButtonText: "关闭窗口",
                        cancelButtonText: "舍弃当前账号",
                        html: false
                    }, function (sel) {
                        if (!sel) {
                            var api = 'http://' + location.host + '/api/logout';
                            $.post(api, {}, function (res) {
                                console.log('POST', api, undefined, res);
                                pieMenu.hide(200, function () {
                                    if (res.code == 1) {
                                        location.href = 'http://' + window.location.host + '/app/welcome';
                                    } else {
                                        toastr.error(res.text);
                                    };
                                });
                            });
                        }
                    });
                };
            });

            //圆按钮点击功能
            pieMenu.hide();
            var menuvis = false;
            pieBall.click(function () {
                if (menuvis == false) {
                    $('body').unbind('click', hidePieMenu);
                    pieMenu.show(200, function () {
                        $('body').bind('click', hidePieMenu);
                    });
                    menuvis = true;
                } else {
                    pieMenu.hide(200);
                    $('body').unbind('click', hidePieMenu);
                    menuvis = false;
                };
            });

            function hidePieMenu() {
                menuvis = false;
                pieMenu.hide(200);
            };

            //读取信息，更新图标和logo
            pieUiGrp.refresh = function () {
                piejs.getUinfo(function (res) {
                    //更新头像,区分男女
                    pieBall.html(piejs.uinfo.nick.substr(0));
                    var cssobj;
                    switch (piejs.uinfo.sex) {
                    case '1':
                        cssobj = {
                            'background-color': piejs.clr.boybg,
                            'border': '1px solid ' + piejs.clr.boybdr,
                            'color': '#FFF',
                        };
                        break;
                    case '2':
                        cssobj = {
                            'background-color': piejs.clr.girlbg,
                            'border': '1px solid ' + piejs.clr.girlbdr,
                            'color': '#FFF',
                        };
                        break;
                    default:
                        cssobj = {
                            'background-color': piejs.clr.light,
                            'border': '1px solid ' + piejs.clr.midlight,
                            'color': piejs.clr.dark,
                        };
                        break;
                    };
                    pieBall.css(cssobj);
                }, function (res) {
                    toastr.error(res.text);
                });
            };
            pieUiGrp.refresh();

            return pieUiGrp;
        };

        //初始化pie的底部信息
        function initPieBot() {
            var pbox = $('#pieBox');
            var botGrp = $('<div id="_pieBotGrp" class="col-xs-12">- Powered by jscodepie.com -</div>');
            botGrp.css({
                'text-align': 'center',
                'color': '#AAA',
                'margin': '0',
                'font-size': '0.8em',
                'margin-top': '2em',
                'margin-bottom': '2em',
            });
            if (pbox[0] != undefined) botGrp.appendTo(pieBox);
            return botGrp;
        };


        //设置toastr
        piejs.configToastr = function (cfg) {
            if (!cfg) cfg = {
                "debug": true,
                "progressBar": false,
                "positionClass": "toast-bottom-center",
                "showDuration": "0",
                "hideDuration": "0",
                "timeOut": "3000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            toastr.options = cfg;
        };
        piejs.configToastr();


        //所有第三方库
        piejs.jslibs = {
            'jquery': {
                alias: '$',
                path: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
            },
            'piejs': {
                alias: 'piejs',
                path: 'http://' + window.location.host + '/lib/piejs/0.1.1/piejs',
            },
            'bootstrap': {
                alias: 'bootstrap',
                path: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
                shim: {
                    deps: ['css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min.css',
                   'css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap-theme.min.css',
                    'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min.js']
                },
            },
            'swal': {
                alias: 'swal',
                path: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
                shim: {
                    deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
                },
            },
            'toastr': {
                alias: 'toastr',
                path: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
                shim: {
                    deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
                }
            },
            'jform': {
                alias: 'jform',
                path: 'http://' + window.location.host + '/lib/jquery.form/3.51/jquery.form.min',
            },
            'md5': {
                alias: 'md5',
                path: 'http://' + window.location.host + '/lib/spark-md5/2.0.2/spark-md5.min',
            },
        };

        piejs.codeTemplate = '';



        return piejs;
    });
