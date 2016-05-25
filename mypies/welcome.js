/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
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
        toastr: {
            deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
        },
        swal: {
            deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
        },
    },
});



/*实际函数运行*/
require(['jquery', 'bootstrap', 'toastr', 'swal'], function ($, bootstrap, toastr, swal) {
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');

    var piebox = $('#pieBox');
    piebox.attr('class', 'row');
    piebox.css('margin', '0');
    var tmp = piebox.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });

    //新手从这里开始，请勿删除此行


    var sexs = {
        '0': '保密',
        '1': '男',
        '2': '女',
    };

    var grpStart = function () {
        var grp = $('<div class="row" style="margin:5% 0;text-align:center"></div>');

        //欢迎组
        var welgrp = $('<div style="margin:1em 0;text-align:center"></div>').appendTo(grp);
        var weltxt = ($('<div style="font-size:1.2em">代码派：每个人都可以学会的编程</div>')).appendTo(welgrp);
        var weletxt = ($('<div style="font-size:0.8em">welcome to jscodepie.com！</div>')).appendTo(welgrp);

        //格言组
        var mottogrp = $('<div style="margin:1em 0;text-align:center"></div>').appendTo(grp);
        mottogrp.css({
            'background': '#CCC',
            'color': '#FFF',
            'padding': '0.5em 0 1em 0'
        })
        var mttxt = ($('<div style="font-size:2.5em">相信你自己</div>')).appendTo(mottogrp);
        var mtetxt = ($('<div style="font-size:0.95em">BELIEVE IN WHO YOU ARE</div>')).appendTo(mottogrp);

        var uinfo;

        //开始按钮
        var lnstart = $('<div style="margin-top:2em"></div>').appendTo(grp);
        var startBtn = $('<a class="btn btn-success btn-lg">立即开始</a>').appendTo(lnstart);
        startBtn.css('padding', '0.5em 3em');
        startBtn.attr('href', 'http://' + location.host + '/app/start');

        //卡片组
        var cardln = $('<div class="row" style="margin:2em 0"></div>').appendTo(grp);
        var cardpnl = $('<div class="panel panel-default "></div>').appendTo(cardln);

        function fillcard() {
            cardpnl.addClass('col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4');
            cardpnl.css({
                'padding': '0'
            })
            var cardhd = $('<div class="panel-heading" style="font-size:1em;height:2em;padding:0.3em 1em"></div>').appendTo(cardpnl);
            var tttxt = $('<span class="pull-left"></span>').appendTo(cardhd);
            var outbtn = $('<a class="pull-right" style="cursor:pointer">注销</a>').appendTo(cardhd);
            var loglink = $('<a class="pull-right" style="cursor:pointer;margin-right:1em">登录</a>').appendTo(cardhd);
            loglink.attr('href', 'http://' + location.host + '/pie/login?tab=login');
            (uinfo.mail) ? tttxt.html('您的派证件'): tttxt.html('您的临时通行证');
            outbtn.click(function () {
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


            var cardbd = $('<div class="panel-body" style="padding:1em 10%;text-align:left;line-height:2em"></div>').appendTo(cardpnl);

            var nickln = $('<div style="height:1.8em"></div>').appendTo(cardbd);
            nickln.append($('<span class="glyphicon glyphicon-user" style="margin-right:1em"> 昵称：</span>'));
            var nicktxt = $('<span class="glyphicon">' + uinfo.nick + '</span>').appendTo(nickln);
            var setlink = $('<a class="glyphicon glyphicon-pencil" style="margin-left:1em"></a>').appendTo(nickln);
            setlink.attr('href', 'http://' + location.host + '/pie/login?tab=setProfile');

            var mailln = $('<div style="height:1.8em"></div>').appendTo(cardbd);
            mailln.append($('<span class="glyphicon glyphicon-envelope" style="margin-right:1em"> 邮箱：</span>'));
            var ml = (uinfo.mail) ? uinfo.mail : '未绑定';
            var mailtxt = $('<span class="glyphicon">' + ml + '</span>').appendTo(mailln);

            var bindlink = $('<a class="btn btn-warning btn-xs" style="margin-left:1em">立即绑定</a>').appendTo(mailln);
            bindlink.attr('href', 'http://' + location.host + '/pie/login?tab=bindMail');
            (uinfo.mail) ? bindlink.hide(): bindlink.show();

            var sexln = $('<div style="height:1.8em"></div>').appendTo(cardbd);
            sexln.append($('<span class="glyphicon glyphicon-info-sign" style="margin-right:1em"> 性别：</span>'));
            var sextxt = $('<span class="glyphicon">' + sexs[uinfo.sex] + '</span>').appendTo(sexln);
            var setlink = $('<a class="glyphicon glyphicon-pencil" style="margin-left:1em"></a>').appendTo(sexln);
            setlink.attr('href', 'http://' + location.host + '/pie/login?tab=setProfile');

            var idln = $('<div style="height:1.8em"></div>').appendTo(cardbd);
            idln.append($('<span class="glyphicon glyphicon-adjust" style="margin-right:1em"> 编号：</span>'));
            var idtxt = $('<span class="glyphicon">' + uinfo.id + '</span>').appendTo(idln);
        };





        //读取用户信息，判断是否要登录
        function getuinfo() {
            var api = 'http://' + location.host + '/api/getMyProfile';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                var uiinfosp = $('<span></span>');
                if (res.code == 1) {
                    uinfo = res.data;
                    fillcard();
                } else {
                    toastr.err(res.text);
                };
            });
        };
        getuinfo();

        return grp;
    }();
    grpStart.appendTo(piebox);
    grpStart.hide().fadeIn(1000);

    var icpdiv = $('<div style="font-size:12px;color:#666;text-align:center"></div').appendTo(piebox);
    icpdiv.css({
        'padding': '2em',
        'text-align': 'center',
        'width': '100%',
    });
    $('<a class="glyphicon" href="http://www.miitbeian.gov.cn">[苏ICP备15036923号-2]</a>').appendTo(icpdiv);

    //bottom
    var botGrp = $('<div class="col-md-12">- Powered by jscodepie.com -</div>').appendTo(pieBox);
    botGrp.css({
        'text-align': 'center',
        'color': '#AAA',
        'margin': '0',
        'font-size': '0.8em'
    })



    //新手到这里结束，请勿删除此行
});
