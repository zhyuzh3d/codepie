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

    var grpLogin = function () {
        var grp = $('<div style="text-align:center;margin-top:15%;line-height:1.5em"></div>');
        grp.append($('<div style="font-size:1em;color:#AAA">网页建设中...</div>'));

        return grp;
    }();
    grpLogin.appendTo(bd);
    grpLogin.hide().fadeIn(1000);

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
