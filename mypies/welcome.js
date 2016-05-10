/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
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
    },
});



/*实际函数运行*/
require(['jquery', 'bootstrap', 'toastr'], function ($, bootstrap, toastr) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });

    var grpStart = function () {
        var grp = $('<div style="text-align:center;margin-top:15%;line-height:1.5em"></div>');
        grp.append($('<div style="font-weight:bold;font-size:1.5em">代码派 !</div>'));
        var lnuinfo = $('<div style="margin-top:1em"></div>').appendTo(grp);
        var usricon = $('<span class="glyphicon glyphicon-user"></span>').appendTo(lnuinfo);
        usricon.css('vertical-align', 'baseline');

        //logoutbtn
        var logoutBtn = $('<span class="glyphicon glyphicon-remove"></span>').appendTo(lnuinfo);
        logoutBtn.css({
            'cursor': 'pointer',
            'color': '#dd2b9f',
            'margin-left': '0.5em',
            'vertical-align': 'baseline'
        });;
        logoutBtn.hide();

        logoutBtn.click(function () {
            var api = 'http://' + location.host + '/api/logout';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                if (res.code == 1) {
                    location.reload();
                };
            });
        });

        //setusrbtn
        var setusrBtn = $('<span class="glyphicon glyphicon-edit"></span>').appendTo(lnuinfo);
        setusrBtn.css({
            'cursor': 'pointer',
            'color': '#2b9fdd',
            'margin-left': '0.5em',
            'vertical-align': 'baseline',
        });
        setusrBtn.hide();

        setusrBtn.click(function () {
            location.href = 'http://' + location.host + '/app/login';
        });


        //startbtn
        var lnstart = $('<div style="margin-top:1em"></div>').appendTo(grp);
        var startBtn = $('<a class="btn btn-success">立即开始</a>').appendTo(lnstart);
        startBtn.css('padding', '0.5em 3em');
        startBtn.attr('href', 'http://' + location.host + '/app/start');


        //读取用户信息，判断是否要登录
        function getuinfo() {
            var api = 'http://' + location.host + '/api/getMyProfile';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                var uiinfosp = $('<span></span>');
                logoutBtn.before(uiinfosp);
                if (res.code == 1) {
                    if (!res.data.mail) {
                        lnuinfo.css('color', '#AAA');
                        setusrBtn.show();
                        uiinfosp.html(' ' + res.data.id + ' : ' + res.data.nick + ' ( unbind mail ) ');
                    } else {
                        lnuinfo.css('color', '#000');
                        uiinfosp.html(res.data.id + ' : ' + res.data.nick + ' ( ' + res.data.mail + ' ) ');
                        logoutBtn.show();
                    };
                } else {
                    toastr.err(res.text);
                };
            });
        };
        getuinfo();

        return grp;
    }();
    grpStart.appendTo(bd);
    grpStart.hide().fadeIn(1000);

    $('<style>a:link,a:visited{text-decoration:none} a:hover{text-decoration:none}</style>').appendTo(bd)
    var icpdiv = $('<div style="font-size:12px;color:#666;text-align:center"></div').appendTo(bd);
    icpdiv.css({
        'position': 'absolute',
        'bottom': '1em',
        'text-align': 'center',
        'width': '100%',
    })
    $('<a href="http://www.miitbeian.gov.cn">[苏ICP备15036923号-2]</a>').appendTo(icpdiv);
});
