/*外部库设置*/
require.config({
    paths: {
        jquery: '//' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        piejs: '//' + window.location.host + '/lib/piejs/0.1.1/piejs',
        jform: '//' + window.location.host + '/lib/jquery.form/3.51/jquery.form.min',
        qiniu: '//' + window.location.host + '/lib/qiniu/qiniu',
        md5: '//' + window.location.host + '/lib/spark-md5/2.0.2/spark-md5.min',
    },
});


/*实际函数运行*/
define(['jquery', 'piejs', 'jform', 'qiniu', 'md5'], function ($, piejs, jform, qiniu, md5) {
    var host = window.location.host;

    /*标题*/
    var lctr = $('#pieBox');
    $('<style>a{text-decoration : none} a:hover{text-decoration:none} </style>').appendTo(lctr);


    /*左右分开*/
    var ls = $('<div id="left" style="width:25%;display:inline-block;vertical-align:top"></div>').appendTo(lctr);
    var bd = $('<div id="right" style="width:75%;display:inline-block;vertical-align:top"></div>').appendTo(lctr);
    bd.css({
        'margin-left': '25%',
        'margin-right': '24px',
        'position': 'fixed',
        'overflow': 'scroll',
        'height': '100%',
        'padding-left': '18px',
    });
    ls.css({
        'position': 'fixed',
        'overflow': 'scroll',
        'height': '100%',
        'padding-left': '12px',
    });
    var pietop = $('<div style="margin-top:8px"></div>').appendTo(ls);
    pietop.append($('<h1 style="margin:0">Sample</h1>'));
    pietop.append($('<div>公共接口示例</div><br>'));
    $('#_pieTemp').remove();


    var grp = $('<div id="---SKTS" style="margin:16px"></div>').appendTo(bd);

    /*获取当前页面skt信息*/
    var grpGetSktInfo = function () {
        var grp = $('<div id="grpGetSktInfo" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>Skt链接后的函数（显示sktinfo)[piejs.sktio.afterCheckinFnArr]</h3>'));

        $('<label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        piejs.sktio.afterCheckinFnArr.push(function () {
            resdiv.html('piejs.sktio.sktInfo:' + JSON.stringify(piejs.sktio.sktInfo));
        });

        return grp;
    }();

    /*通过pid获取对应的单个端口skt*/
    var grpGetSktByUidPid = function () {
        var grp = $('<div id="grpGetSktByUidPid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>通过uid/pid获取单个skt[sktapi:getSktByUidPid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getSktByUidPid');
        $('<label>uid</label>').appendTo(fm);
        var uidipt = $('<input name="uid">').val('1').appendTo(fm);
        $('<label>pid</label>').appendTo(fm);
        var pidipt = $('<input name="pid">').val('4').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getSktByUidPid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    /*通过pid获取对应的端口skts*/
    var grpGetSktsByUidPid = function () {
        var grp = $('<div id="grpGetSktsByUidPid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>通过uid获取多个skts[sktapi:getSktsByUidPid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getSktsByUidPid');
        $('<label>uid</label>').appendTo(fm);
        var uidipt = $('<input name="uid">').val('1').appendTo(fm);
        $('<label>pid</label>').appendTo(fm);
        var pidipt = $('<input name="pid">').val('4').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getSktsByUidPid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    /*通过pid获取对应的端口skts*/
    var grpGetSktsByPid = function () {
        var grp = $('<div id="grpGetSktsByPid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>通过pid获取skts[sktapi:getSktsByPid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getSktsByPid');
        $('<label>pid</label>').appendTo(fm);
        var pidipt = $('<input name="pid">').val('4').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getSktByPid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();

    /*通过uid获取对应的端口skts*/
    var grpGetSktsByUid = function () {
        var grp = $('<div id="grpGetSktsByUid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>通过uid获取skts[sktapi:getSktsByUid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getSktsByUid');
        $('<label>uid</label>').appendTo(fm);
        var uidipt = $('<input name="uid">').val('1').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getSktByUid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();






    var grp = $('<div id="---USER" style="margin:16px"></div>').appendTo(bd);


    /*获取其他人的基础信息，使用mail*/
    var grpGetUsrInfoByMail = function () {
        var grp = $('<div id="grpGetUsrInfoByMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取他人信息，已知邮箱[../api/getUsrInfoByMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getUsrInfoByMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getUsrInfoByMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    /*获取其他人的基础信息，使用用户id*/
    var grpGetUsrInfoByUid = function () {
        var grp = $('<div id="grpGetUsrInfoByUid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取他人信息，已知用户id[../api/getUsrInfoByUid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getUsrInfoByUid');
        $('<label>id</label>').appendTo(fm);
        var mailipt = $('<input name="id">').val('1').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getUsrInfoByUid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();

    /*设置自己的个人资料*/
    var grpSetProfile = function () {
        var grp = $('<div id="grpSetProfile" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>修改个人资料[../api/setProfile]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/setProfile');
        $('<label>nick</label>').appendTo(fm);
        var nickipt = $('<input name="nick">').val('macaroon').appendTo(fm);
        $('<label>sex</label>').appendTo(fm);
        var sexipt = $('<input name="sex">').val(1).appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击保存</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('setProfile', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();




    /*获取用户自己的信息*/
    var grpGetMyProfile = function () {
        var grp = $('<div id="grpGetMyProfile" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>使获得用户自身信息[../api/getMyProfile]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getMyProfile');
        var sendbtn = $('<button style="padding:8px 16px">点击刷新</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getMyProfile', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });
        sendbtn.click();

        return grp;
    }();





    /*使用邮箱登陆*/
    var grpLoginByMail = function () {
        var grp = $('<div id="grpLoginByMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>使用邮箱登陆[../api/loginByMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/loginByMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        $('<label>pw</label>').appendTo(fm);
        var pw = $('<input name="pw">').val('password').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击登陆</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            pw.val(md5.hash(pw.val()));
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('loginByMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();





    /*向邮箱发送重置密码的接口*/
    var grpSendResetPwToMail = function () {
        var grp = $('<div id="grpSendResetPwToMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>向邮箱发送重置密码的接口[../api/sendResetPwToMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/sendResetPwToMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">发送重置密码</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('sendResetPwToMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();



    /*修改邮箱密码的接口*/
    var grpChangePw = function () {
        var grp = $('<div id="grpChangePw" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>修改邮箱密码接口[../api/changePw]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/changePw');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        $('<label>orgPw</label>').appendTo(fm);
        var orgpw = $('<input name="orgPw">').val('password').appendTo(fm);
        $('<label>newPw</label>').appendTo(fm);
        var newpw = $('<input name="newPw">').val('password').appendTo(fm);
        var isrst = $('<input type="checkbox" name="isRest">').attr('checked', false).appendTo(fm);
        $('<span>重置密码</span>').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击修改</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            if (!isrst.val()) {
                //为密码加密处理,如果是重置那么不加密
                orgpw.val(md5.hash(ogrpw.val()));
            };
            newpw.val(md5.hash(newpw.val()));
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('bindMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();




    /*通过邮箱获得注册获取验证码*/
    var grpSendRegCodeToMail = function () {
        var grp = $('<div id="grpSendRegCodeToMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获得邮箱注册验证码的接口[../api/sendRegCodeToMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/sendRegCodeToMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        var resendchk = $('<input type="checkbox" name="resend">').attr('checked', true).appendTo(fm);
        $('<span>重新发送</span>').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击发送验证码</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('sendRegCodeToMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    /*绑定邮箱，需要注册验证码*/
    var grpBindMail = function () {
        var grp = $('<div id="grpBindMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>绑定邮箱到当前用户[../api/bindMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/bindMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('chef@jscodepie.com').appendTo(fm);
        $('<label>regCode</label>').appendTo(fm);
        var regCodeipt = $('<input name="regCode">').appendTo(fm);
        $('<label>pw</label>').appendTo(fm);
        var pwipt = $('<input name="pw">').val('password').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击绑定</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('bindMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    var grp = $('<div id="---PIE" style="margin:16px"></div>').appendTo(bd);

    /*获取其他人Pie的基础信息，使用pid*/
    var grpGetPieInfoByPid = function () {
        var grp = $('<div id="grpGetPieInfoByPid" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取他pie信息，已知pid[../api/getPieInfoByPid]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getPieInfoByPid');
        $('<label>id</label>').appendTo(fm);
        var pidipt = $('<input name="id">').val('4').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getPieInfoByPid', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();

    /*获取App（pie）公开信息的接口*/
    var grpGetPieInfoByPuidPnm = function () {
        var grp = $('<div id="grpGetPieInfoByPuidPnm" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取pie公开信息的接口[../api/getPieInfoByPuidPnm]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getPieInfoByPuidPnm');
        $('<label>uid</label>').appendTo(fm);
        var authoridipt = $('<input name="uid" value="1">').appendTo(fm);
        $('<label>name</label>').appendTo(fm);
        var nameipt = $('<input name="name">').val('sample').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getPieInfo', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();




    /*获取我的pieapp列表的接口*/
    var grpGetPieList = function () {
        var grp1 = $('<div id="grpGetPieList" style="margin:16px"></div>').appendTo(bd);
        grp1.append($('<h3>创建pieApp的接口[../api/getPieList]</h3>'));
        var grp = $('<div id="grpSetPieStateByName" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>设置pie的state接口[.../api/setPieStateByName]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getPieList');
        var sendbtn = $('<button style="padding:8px 16px">刷新列表</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resul = $('<ul"></ul>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        function addpie(name, state) {
            var li = $('<li></li>');
            var pfm = $('<form method="post" enctype="text/plain"></form>').appendTo(li);
            pfm.attr('action', '../api/setPieStateByName');
            $('<label>name</label>').appendTo(pfm);
            var nameipt = $('<input name="name">').val(name).appendTo(pfm);
            $('<label>state</label>').appendTo(pfm);
            var stateipt = $('<input name="state" style="width:50px">').val(state).appendTo(pfm);
            var delbtn = $('<span style="color:#F00;cursor:pointer">设置</span>').appendTo(pfm);
            li.appendTo(resul);

            delbtn.click(function (e) {
                e.preventDefault();
                pfm.ajaxSubmit({
                    type: 'POST',
                    success: function (res) {
                        console.log('remove pie', res);
                        resdiv.html(JSON.stringify(res));
                    },
                });
            });
        };


        sendbtn.click(function (e) {
            resul.empty();
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('getPieList', res);
                    resdiv.html(JSON.stringify(res));
                    if (res.code == 1) {
                        for (var i in res.data.pieArr) {
                            var pie = res.data.pieArr[i];
                            addpie(pie.name, pie.state);
                        };
                    };
                },
            });
        });
        sendbtn.click();

        return grp;
    }();



    /*创建App（pie）的接口*/
    var grpCreatePie = function () {
        var grp = $('<div id="grpCreatePie" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>创建pieApp的接口[../api/createPie]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/createPie');
        $('<label>name</label>').appendTo(fm);
        var pathipt = $('<input name="name">').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击创建一个pie应用</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resa = $('<a target="_blank"></a>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');


        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('createpie', res);
                    resdiv.html(JSON.stringify(res));
                    if (res.code == 1) {
                        resa.html(res.data.url);
                        resa.attr('href', res.data.url);
                    };
                },
            });
        });

        return grp;
    }();


    var grp = $('<div id="---FILE" style="margin:16px"></div>').appendTo(bd);

    /*获取文件列表*/
    var grpGetFileList = function () {
        var grp = $('<div id="grpGetFileList" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取文件列表的接口[../api/getFileList]</h3>'));
        var grp1 = $('<div id="grpDeleteFile" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<h3>删除文件接口[../api/deleteFile]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getFileList');
        $('<label>path</label>').appendTo(fm);
        var pathipt = $('<input name="path">').appendTo(fm);
        $('<label>limit</label>').appendTo(fm);
        var limitipt = $('<input name="limit">').val(2).appendTo(fm);
        $('<label>marker</label>').appendTo(fm);
        var markipt = $('<input name="marker">').val('').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取文件列表</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resul = $('<ul></ul>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');


        function addFile(jo, key, state) {
            var li = $('<span></span>');
            var pfm = $('<form method="post" enctype="text/plain"></form>').appendTo(li);
            pfm.attr('action', '../api/deleteFile');
            $('<label>key</label>').appendTo(pfm);
            var keyipt = $('<input name="key">').val(key).appendTo(pfm);
            var delbtn = $('<span style="color:#F00;cursor:pointer">删除</span>').appendTo(pfm);
            li.appendTo(jo);

            delbtn.click(function (e) {
                e.preventDefault();
                pfm.ajaxSubmit({
                    type: 'POST',
                    success: function (res) {
                        console.log('delete file', res);
                        resdiv.html(JSON.stringify(res));
                    },
                });
            });
        };


        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    var resobj = res;
                    markipt.val(resobj.marker);
                    resdiv.html(JSON.stringify(res));
                    resul.empty();
                    resobj.items.forEach(function (one, i) {
                        var li = $('<li></li>').appendTo(resul);
                        var furl = resobj.domain + one.key;
                        li.html('<a target="_blank" href="' + furl + '">' + furl + '</a>');
                        addFile(li, one.key);
                    });
                },
            });
        });

        return grp;
    }();




    /*直接上传一个文件*/
    var grpUploadFile = function () {
        var grp = $('<div id="grpUploadFile" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>上传文件方法,使用uploadToken接口[../api/getUploadToken]</h3>'))

        var fm = $('<form method="post" action="http://upload.qiniu.com/" enctype="multipart/form-data"></form>');
        $('<label>file</label>').appendTo(fm);
        var iptfile = $('<input name="file" type="file">').appendTo(fm);
        $('<label>token</label>').appendTo(fm);
        var ipttoken = $('<input name="token" type="">').attr('value', '...').appendTo(fm);
        $('<label>key</label>').appendTo(fm);
        var iptkey = $('<input name="key" type="">').attr('value', '...').appendTo(fm);
        $('<br><br>RES:<br>').appendTo(fm);
        var reslink = $('<a>...</a>').appendTo(fm);
        fm.appendTo(grp);

        var resdiv = $('<div id="myResultsDiv"></div>').appendTo(grp);
        iptfile.on('change', function () {
            var furl = iptfile.val();
            if (furl == '' || !furl) return;

            //获取uploadtoken并填充ipttoken
            var api = "../api/getUploadToken?fpath=" + furl.substring(furl.lastIndexOf('\\') + 1);
            $.post(api, function (res) {
                //上传文件
                ipttoken.val(res.data.uptoken);
                iptkey.val(res.data.key);
                fm.ajaxSubmit({
                    type: 'POST',
                    success: function (fileinfo) {
                        fileinfo.domain = res.data.domain;
                        fileinfo.url = fileinfo.domain + res.data.key;
                        reslink.html(fileinfo.url);
                        reslink.attr('href', fileinfo.url);
                    },
                });
            });
        });
        return grp;
    }();




    /*获取上传文件的uploadtoken
    form必须是enctype="text/plain"
    */
    var grpUploadToken = function () {
        var grp = $('<div id="grpUploadToken" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取上传文件的接口[../api/getUploadToken]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getUploadToken');
        $('<label>fpath</label>').appendTo(fm);
        var iptfile = $('<input name="fpath">').appendTo(fm);

        var sendbtn = $('<button style="padding:8px 16px">点击获取上传token</button>').appendTo(grp);

        grp.append($('<br><br><label>RES:</label>'));
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                success: function (res) {
                    var resstr = JSON.stringify(res);
                    resdiv.html(resstr);
                },
            });
        })

        return grp;
    }();



    /*上传一个字符串作为文件;
    str上传的文字；ext文件的后缀名如'js'
    上传一个字符串存储为文件
    */
    var grpUploadStr = function () {
        var grp = $('<div id="grpUploadStr" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>上传字符串存储为文件[../api/uploadData]</h3>'))

        grp.append($('<label>file:</label>'));
        grp.fileIpt = $('<input>').appendTo(grp);

        grp.append($('<label>data:</label>'));
        grp.dataTa = $('<textarea></textarea>').appendTo(grp);

        grp.btn = $('<br><br><button style="padding:8px 16px">保存为文件</button>').appendTo(grp);

        grp.append($('<br><label>RES:</label>'));
        var resdiv = $('<div>...</div>').appendTo(grp);
        resdiv.css('word-break', 'break-all');

        grp.btn.click(function () {
            var data = {
                data: grp.dataTa.val(),
                file: grp.fileIpt.val(),
            };
            $.post("../api/uploadData", data, function (res) {
                console.log("../api/uploadData", res);
                var url = encodeURI(res.data.url);
                var resstr = JSON.stringify(res);
                resdiv.html(resstr + '<br><a href="' + url + '" target="_blank">' + url + '</a>');
            });
        });

        return grp;
    }();




    //生成左侧列表
    bd.children().each(function (i, obj) {
        var jo = $(obj);
        jo.css('padding-right', '32px');
        var grp = jo.attr('id');
        var div = $('<div style="line-height:20px"></div>').appendTo(ls);
        if (grp.substr(0, 3) == '---') {
            div.css('background-color', '#EEE');
            div.css('margin-top', '8px');
        };
        var idx = $('<a style="white-space:pre" href="#' + grp + '">' + grp.substr(3) + '</a>');
        idx.appendTo(div);
    });
    console.log('API total count:', bd.children().length);


    //底部空间
    bd.append($('<div style="margin:16px 0 120px 12px"><hr><br>Create by jscodepie</div>'))
        //end
});
