/*外部库设置*/
require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min'
    },
});

/*实际函数运行*/
require(['jquery'], function ($) {
    var bd = $('#_pieLocator');
    var tmp = bd.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });

    var grpStart = function () {
        var grp = $('<div style="text-align:center;margin-top:20%;line-height:1.5em"></div>');
        grp.append($('<div>代码派!</div>'));
        grp.append($('<div>Welcome to js codepie !</div>'));
        grp.append($('<div style="font-size:12px">网站建设中，即将开启...</div><br>'));
        return grp;
    }();
    grpStart.appendTo(bd);
    grpStart.hide().fadeIn(1000);
});
