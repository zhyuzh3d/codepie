/*外部库设置*/
require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min'
    },
});

/*实际函数运行*/
require(['jquery'], function ($) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });

    var grpStart = function () {
        var grp = $('<div style="text-align:center;margin-top:15%;line-height:1.5em"></div>');
        grp.append($('<div style="font-weight:bold;font-size:18px;line-height:36px">代码派 !</div>'));
        grp.append($('<div style="line-height:16px">Welcome to js codepie !</div>'));
        grp.append($('<div style="font-size:12px">-pie:welcome-</div>'));
        grp.append($('<div style="font-size:12px">网站建设中，即将开启...</div>'));
        return grp;
    }();
    grpStart.appendTo(bd);
    grpStart.hide().fadeIn(1000);

    $('<style>a:link,a:visited{text-decoration:none} a:hover{text-decoration:none}</style>').appendTo(bd)
    var icpdiv = $('<div style="font-size:12px;color:#666;text-align:center"></div').appendTo(bd);
    icpdiv.css({
        'position':'absolute',
        'bottom':'10px',
        'text-align':'center',
        'width':'100%',
    })
    $('<a href="http://www.miitbeian.gov.cn">[苏ICP备15036923号-2]</a>').appendTo(icpdiv);
});
