/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
        md5: 'http://' + window.location.host + '/lib/spark-md5/2.0.2/spark-md5.min',
        piejs: 'http://' + window.location.host + '/lib/piejs/0.1.1/piejs',
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



/*实际函数运行*/
require(['jquery', 'bootstrap', 'swal', 'toastr', 'md5', 'piejs'], function ($, bootstrap, swal, toastr, md5, piejs) {
    var pieBox = $('#pieBox');
    var tmp = pieBox.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
        genNavbar().prependTo(pieBox);
    });

    var topNavbar;
    var genNavbar = function () {
        var navbar = $('<div class="row breadcrumb" style="margin:0;border-radius:0"></div>');
        var backbtn = $('<li class="btn" style="padding:0">返回</li>').appendTo(navbar);
        var refreshbtn = $('<li class="btn" style="padding:0">我的应用列表</li>').appendTo(navbar);
        backbtn.click(function () {
            window.location.href = document.referrer;
        });
        refreshbtn.click(function () {
            location.reload();
        });

        return navbar;
    };


    var grpLogin = function () {
        var grp = $('<div class="row" style="margin:2em 0;"></div>');
        var grpbox = $('<div></div>').appendTo(grp);
        grpbox.addClass('col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-10 col-xs-offset-1');


        var navgrp = $('<ul class="nav nav-tabs" role="tablist"></ul>').appendTo(grpbox);
        var logintab = $('<li role="presentation" ><a href="#loginpnl" aria-controls="loginpnl" role="tab" data-toggle="tab" data-toggle="tab">账号登录</a></li>').appendTo(navgrp);
        var bindtab = $('<li role="presentation" ><a href="#bindpnl" aria-controls="bindpnl" role="tab" data-toggle="tab" data-toggle="tab">绑定邮箱</a></li>').appendTo(navgrp);
        var settab = $('<li role="presentation" ><a href="#setpnl" aria-controls="setpnl" role="tab" data-toggle="tab">修改资料</a></li>').appendTo(navgrp);
        var rsttab = $('<li role="presentation" ><a href="#rstpwpnl" aria-controls="rstpwpnl" role="tab" data-toggle="tab">重置密码</a></li>').appendTo(navgrp);

        var pnlgrp = $('<div class="tab-content"></div>').appendTo(grpbox);
        pnlgrp.css({
            'width': '100%',
            'border': '1px solid #CCC',
            'border-top': 'none',
            'border-radius': '0.25em',
            'padding': '1em 2em 2em 2em',
        });


        //post读取资料初始化数据显示
        var uinfo;

        function getuinfo() {
            var api = 'http://' + location.host + '/api/getMyProfile';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                if (res.code == 1) {
                    uinfo = res.data;
                    fillSetPnl();
                    fillBindpnl();
                    fillloginpnl();
                    fillrstpwpnl();

                    var tab = piejs.getUrlParam('tab');
                    if (tab) {
                        switch (tab) {
                        case 'setProfile':
                            settab.find('a').click();
                            break;
                        case 'bindMail':
                            bindtab.find('a').click();
                            break;
                        case 'resetPw':
                            rsttab.find('a').click();
                            break;
                        case 'login':
                            logintab.find('a').click();
                            break;
                        };
                    } else if (uinfo.mail) {
                        settab.find('a').click();
                    } else {
                        bindtab.find('a').click();
                    }
                } else {
                    toastr.error(res.text);
                };
            });
        };
        getuinfo();



        //忘记密码
        var rstpwpnl = $('<div role="tabpanel" class="tab-pane" id="rstpwpnl"></div>').appendTo(pnlgrp);
        $('<p>Loading...</p>').appendTo(rstpwpnl);

        function fillrstpwpnl(mail, torst) {
            rstpwpnl.empty();

            var rstgrp = $('<div style="margin-top:1em"></div>').appendTo(rstpwpnl);
            var isrst = false;

            var typegrp = $('<div class="btn-group row" data-toggle="buttons"></div>').appendTo(rstgrp);
            typegrp.css({
                'width': '100%',
                'margin': '0 0 1em 0'
            });

            var userstbtn = $('<label class="btn btn-default col-xs-6 "><input type="radio"  val="0" autocomplete="off" checked>使用重置码</label>').appendTo(typegrp);
            var useoldbtn = $('<label class="btn btn-default col-xs-6 active"><input type="radio"  val="1" autocomplete="off" checked>使用老密码</label>').appendTo(typegrp);

            var mailfm = $('<div style="line-height:2.2em" class="form-group">邮箱</div>').appendTo(rstgrp);
            var mailipt = $('<input type="email" class="form-control" placeholder="请输入您绑定的邮箱账号">').appendTo(mailfm);
            if (mail) {
                mailipt.val(mail);
            } else if (uinfo.mail) {
                mailipt.val(uinfo.mail);
            } else {
                mailipt.val('');
            };

            var orgpwfm = $('<div style="line-height:2.2em" class="form-group"></div>').appendTo(rstgrp);
            var orgpwlb = $('<label>老密码</label>').appendTo(orgpwfm);
            var orgpwipt = $('<input type="password" class="form-control" placeholder="原6～64位字符密码">').appendTo(orgpwfm);

            var newpwfm = $('<div style="line-height:2.2em" class="form-group">新密码</div>').appendTo(rstgrp);
            var newpwipt = $('<input type="password" class="form-control" placeholder="任意6～64位字符">').appendTo(newpwfm);

            var rstbtn = $('<button class="btn btn-success">修改密码</button>').appendTo(rstgrp);

            userstbtn.click(function () {
                isrst = true;
                orgpwipt.attr('type', 'text');
                orgpwipt.attr('placeholder', '邮箱中的8位字符')
                orgpwlb.html('重置码');
            });
            useoldbtn.click(function () {
                isrst = true;
                orgpwipt.attr('type', 'password');
                orgpwipt.attr('placeholder', '原6～64位字符密码')
                orgpwlb.html('老密码');
            });


            rstbtn.click(function () {
                if (!isrst && !uinfo.mail) {
                    swal({
                        type: 'warning',
                        title: '',
                        text: '请先绑定邮箱或登录',
                    });
                    return;
                };

                var orgpw = (isrst) ? orgpwipt.val() : md5.hash(orgpwipt.val());
                var ml = (isrst) ? mailipt.val() : uinfo.mail;

                var api = 'http://' + location.host + '/api/changePw';
                var dt = {
                    mail: ml,
                    orgPw: orgpw,
                    newPw: md5.hash(newpwipt.val()),
                    isRest: isrst,
                };
                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code == 1) {
                        swal({
                            type: 'success',
                            title: '',
                            text: '修改成功！请用新的密码登录',
                        }, function () {
                            location.reload();
                        });
                    } else {
                        toastr.error(res.text);
                    }
                });
            });

            if (torst) userstbtn.click();
        };




        //账号登录
        var loginpnl = $('<div role="tabpanel" class="tab-pane" id="loginpnl"></div>').appendTo(pnlgrp);
        $('<p>Loading...</p>').appendTo(loginpnl);

        function fillloginpnl() {
            loginpnl.empty();

            //登出租
            var outgrp = $('<div style="margin-top:1em"></div>').appendTo(loginpnl);
            outgrp.hide();
            var mailp = $('<p>您已登陆成功:' + uinfo.mail + '，ID：' + uinfo.id + '</p>').appendTo(outgrp);

            var logoutbtn = $('<button class="btn btn-default">注销</button>').appendTo(outgrp);
            logoutbtn.click(function () {
                var api = 'http://' + location.host + '/api/logout';
                $.post(api, {}, function (res) {
                    console.log('POST', api, undefined, res);
                    if (res.code == 1) {
                        swal({
                            type: 'success',
                            title: '',
                            text: '退出成功，点击确定刷新页面',
                        }, function () {
                            location.reload();
                        });
                    } else {
                        toastr.error(res.text);
                    };
                });
            });

            //登录组
            var ingrp = $('<div style="margin-top:1em"></div>').appendTo(loginpnl);
            ingrp.hide();
            var mailfm = $('<div style="line-height:2.2em" class="form-group">账号</div>').appendTo(ingrp);
            var mailipt = $('<input type="email" class="form-control" placeholder="请输入您绑定的邮箱">').appendTo(mailfm);

            var pwfm = $('<div style="line-height:2.2em" class="form-group">密码</div>').appendTo(ingrp);
            var pwipt = $('<input type="password" class="form-control" placeholder="任意6～64位字符">').appendTo(pwfm);

            var loginbtn = $('<button class="btn btn-success" style="width:100%">登录</button>').appendTo(ingrp);

            //重置密码
            var sendpwbtn = $('<button class="btn btn-success" style="margin-right:1em">发送重置密码到邮箱</button>').appendTo(ingrp);
            sendpwbtn.hide();
            var canclebtn = $('<button class="btn btn-default">取消</button>').appendTo(ingrp);
            canclebtn.hide();
            var misspwbtn = $('<div class="glyphicon" style="cursor:pointer;display:block">忘记密码了?</div>').appendTo(ingrp);
            misspwbtn.css({
                'cursor': 'pointer',
                'display': 'block',
                'margin': '1em 0',
                'font-size': '0.8em'
            })

            //显示发送重置密码部分
            misspwbtn.click(function () {
                loginbtn.hide(200);
                sendpwbtn.show(200);
                canclebtn.show(200);
                misspwbtn.hide(200);
                pwfm.hide(200);
            });

            //隐藏发送重置密码部分
            canclebtn.click(function () {
                loginbtn.show(200);
                sendpwbtn.hide(200);
                canclebtn.hide(200);
                misspwbtn.show(200);
                pwfm.show(200);
            });

            //发送重置密码
            sendpwbtn.click(function () {
                var api = 'http://' + location.host + '/api/sendResetPwToMail';
                var dt = {
                    mail: mailipt.val(),
                };

                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code == 1) {
                        swal({
                            type: 'success',
                            title: '',
                            text: '重置码已经发送到您的邮箱(24小时后失效)\n请使用它重置您的密码',
                        }, function () {
                            fillrstpwpnl(dt.mail, true);
                            rsttab.find('a').click();
                        });
                    } else {
                        toastr.error(res.text);
                    }
                });
            });


            //正常登录
            loginbtn.click(function () {
                var api = 'http://' + location.host + '/api/loginByMail';
                var dt = {
                    mail: mailipt.val(),
                    pw: md5.hash(pwipt.val()),
                };
                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code == 1) {
                        swal({
                            type: 'success',
                            title: '',
                            text: '登录成功！点击确定刷新页面',
                        }, function () {
                            location.reload();
                        });
                    } else {
                        toastr.error(res.text);
                    }
                });
            });


            if (uinfo.mail) {
                outgrp.show();
                ingrp.hide();
            } else {
                ingrp.show();
                outgrp.hide();
            };
        };


        //修改个人资料
        var setpnl = $('<div role="tabpanel" class="tab-pane" id="setpnl"></div>').appendTo(pnlgrp);
        $('<p>Loading...</p>').appendTo(setpnl);

        function fillSetPnl() {
            setpnl.empty();
            var logintip = $('<p >您的邮箱账号是...</p>').appendTo(setpnl);
            logintip.css({
                'line-height': '3em',
            });

            //昵称组
            var fmgrp1 = $('<div style="line-height:2.2em" class="form-group">昵称</div>').appendTo(setpnl);
            var nickipt = $('<input type="text" class="form-control" id="nick" name="nick" placeholder="任意0～16个中英文字符">').appendTo(fmgrp1);

            //性别组
            var fmgrp2 = $('<div style="line-height:2.2em" class="form-group">性别</div>').appendTo(setpnl);
            $('<label>性别</label><br>').appendTo(fmgrp2);
            var sexbtngrp = $('<div class="btn-group row" data-toggle="buttons"></div>').appendTo(fmgrp2);
            sexbtngrp.css({
                'width': '100%',
                'margin': '0'
            });

            sexbtngrp.sextg0 = $('<label class="btn btn-default col-xs-4 active"><input type="radio"  val="0" autocomplete="off" checked>保密</label>').appendTo(sexbtngrp);
            sexbtngrp.sextg2 = $('<label class="btn btn-default col-xs-4"><input type="radio"  val="2" autocomplete="off" checked>女</label>').appendTo(sexbtngrp);
            sexbtngrp.sextg1 = $('<label class="btn btn-default col-xs-4"><input type="radio"  val="1" autocomplete="off" checked>男</label>').appendTo(sexbtngrp);

            //初始化数据显示
            sexbtngrp['sextg' + uinfo.sex].button('toggle');
            nickipt.val(uinfo.nick);
            if (!uinfo.mail) {
                logintip.html('您当前使用的是临时账号ID:' + uinfo.id + '，请绑定邮箱或重新登录');
                logintip.css('color', '#c30000')
            } else {
                logintip.html('您已绑定邮箱账号:' + uinfo.mail + '，ID：' + uinfo.id);
                logintip.css('color', '#444')
            };

            var setbtn = $('<button class="btn btn-success">保存</button>').appendTo(setpnl);
            setbtn.css({
                'width': '100%',
                'margin-top': '1em',
            })
            setbtn.click(function () {
                setbtn.attr('disabled', true);
                var api = 'http://' + location.host + '/api/setProfile';
                var dt = {
                    nick: nickipt.val(),
                    sex: sexbtngrp.find('.active').children('input').attr('val'),
                };
                $.post(api, dt, function (res) {
                    setbtn.attr('disabled', false);
                    if (res.code == 1) {
                        swal({
                            type: 'warning',
                            title: '',
                            text: '保存成功'
                        });
                    } else {
                        swal({
                            type: 'warning',
                            title: '',
                            text: '保存失败:' + res.text
                        });
                    };
                });
            });
        };



        //绑定邮箱
        var bindpnl = $('<div role="tabpanel" class="tab-pane" id="bindpnl"></div>').appendTo(pnlgrp);
        $('<p>Loading...</p>').appendTo(bindpnl);

        function fillBindpnl() {
            bindpnl.empty();

            //账号信息显示，可以改变重新绑定，点击后显示reg自己隐藏
            var changegrp = $('<div style="margin:1em 0"></div>').appendTo(bindpnl);
            var mailtxt = $('<span></span>').appendTo(changegrp);
            var changebtn = $('<span class="glyphicon glyphicon-pencil"></span>').appendTo(changegrp);
            if (!uinfo.mail) {
                mailtxt.html('您当前使用的是临时账号ID：' + uinfo.id + '，请用验证码绑定邮箱或重新登录');
                mailtxt.css('color', '#c30000');
                changebtn.hide();
            } else {
                mailtxt.html('您已绑定邮箱账号：' + uinfo.mail + '，ID：' + uinfo.id + ']');
                mailtxt.css('color', '#000');
            };

            changebtn.css({
                'color': '#2b9fdd',
                'margin-left': '1em',
                'cursor': 'pointer',
            });
            changebtn.click(function () {
                mailipt.val(uinfo.mail);
                regcancelBtn.show();
                reggrp.show(200);
                changegrp.hide(200);
            });


            //发送注册码，成功后显示change自己隐藏
            var reggrp = $('<div style="margin-top:1em"></div>').appendTo(bindpnl);
            var grpmail = $('<div style="line-height:2.2em" class="form-group">邮箱账号</div>').appendTo(reggrp);
            var mailipt = $('<input type="email" class="form-control" placeholder="请输入您的常用邮箱">').appendTo(grpmail);
            mailipt.val(uinfo.mail);
            var regcodeBtn = $('<button class="btn btn-success" style="margin-right:1em">发送注册验证码</button>').appendTo(reggrp);
            var regcancelBtn = $('<button class="btn btn-default">取消</button>').appendTo(reggrp);
            regcancelBtn.hide();
            regcancelBtn.click(function () {
                reggrp.hide(200);
                regcancelBtn.hide();
                changegrp.show(200);
            });
            regcodeBtn.click(function () {
                var api = 'http://' + location.host + '/api/sendRegCodeToMail';
                var dt = {
                    mail: mailipt.val(),
                };
                regcodeBtn.attr('disabled', true);
                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code == 1) {
                        swal({
                            type: 'success',
                            title: '',
                            text: '注册码已经发送到您的邮箱(24小时后失效)，请注意查收'
                        });
                        bindgrp.show(200);
                    } else {
                        swal({
                            type: 'warning',
                            title: '',
                            text: res.text
                        });
                    };
                    regcodeBtn.attr('disabled', false);
                });
            });

            //绑定并登陆
            var bindgrp = $('<div style="margin-top:1em"></div>').appendTo(bindpnl);
            bindgrp.hide();
            var grpreg = $('<div style="line-height:2.2em" class="form-group">注册码</div>').appendTo(bindgrp);
            var regcodeipt = $('<input type="text" class="form-control" placeholder="请输入邮箱中收到的注册码(6位数字)">').appendTo(grpreg);

            var grppw = $('<div style="line-height:2.2em" class="form-group">账号密码</div>').appendTo(bindgrp);
            var pwipt = $('<input type="password" class="form-control" placeholder="任意6～64位字符">').appendTo(grppw);

            var bindBtn = $('<button class="btn btn-success" style="width:100%">完成注册</button>').appendTo(bindgrp);
            bindBtn.click(function () {
                //格式验证
                var rcode = regcodeipt.val();
                if (!/^\d{6}$/.test(rcode)) {
                    swal({
                        type: 'warning',
                        title: '',
                        text: '注册码必须是6位数字'
                    });
                    return;
                };

                var pw = pwipt.val();
                if (pw.length < 6 || pw.length > 64) {
                    swal({
                        type: 'warning',
                        title: '',
                        text: '密码不能少于6位，不能多于64位'
                    });
                    return;
                };

                //发送请求
                var api = 'http://' + location.host + '/api/bindMail';
                var dt = {
                    mail: mailipt.val(),
                    regCode: rcode,
                    pw: pw,
                };
                regcodeBtn.attr('disabled', true);
                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code == 1) {
                        //成功，自动登录,清理密码注册码
                        swal({
                            type: 'success',
                            title: '',
                            text: '绑定成功！'
                        });
                        autologin(dt.mail, pw, function () {
                            reggrp.hide(200);
                            bindgrp.hide(200);
                            changegrp.show(200);
                            mailtxt.html('您已绑定邮箱账号:' + uinfo.mail + '，ID：' + uinfo.id);
                            mailtxt.css('color', '#000');
                            changebtn.show(200);
                            uinfo.mail = dt.mail;
                            regcodeipt.val('');
                            pwipt.val('');
                        });
                    } else {
                        swal({
                            type: 'warning',
                            title: '',
                            text: res.text
                        });
                    };
                    regcodeBtn.attr('disabled', false);
                });
            });

            //初始化隐藏
            if (uinfo.mail) {
                reggrp.hide();
                bindgrp.hide();
                mailtxt.html('您已绑定邮箱账号:' + uinfo.mail + '，ID：' + uinfo.id);
                mailtxt.css('color', '#000');
            };
        };

        //自动登录
        function autologin(mail, pw, okfn) {
            var api = 'http://' + location.host + '/api/loginByMail';
            var dt = {
                mail: mail,
                pw: pw,
            };
            $.post(api, dt, function (res) {
                console.log('POST', api, dt, res);
                if (res.code == 1) {
                    okfn();
                    toastr.info('自动登录成功.');
                } else {
                    toastr.error(res.text);
                };
            });
        };

        return grp;
    }();
    grpLogin.appendTo(pieBox);
    grpLogin.hide().fadeIn(1000);

    var icpdiv = $('<div style="font-size:12px;color:#666;text-align:center"></div').appendTo(bd);
    icpdiv.css({
        'padding': '2em',
        'text-align': 'center',
        'width': '100%',
    });
    $('<a class="glyphicon" href="http://www.miitbeian.gov.cn">[苏ICP备15036923号-2]</a>').appendTo(icpdiv);
});
