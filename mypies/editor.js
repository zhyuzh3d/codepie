/*外部库设置*/
require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min',
        codemirror: '//cdn.bootcss.com/codemirror/5.12.0/codemirror',
    },
});


/*实际函数运行*/
require(['jquery', 'codemirror'], function ($, codemirror) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });


    var grpStart = function () {
        var grp = $('<div style="text-align:center;margin-top:15%;line-height:1.5em"></div>');

        bd.ready(function () {
            var myCodeMirror = codemirror(grp, {
                value: "function myScript(){return 100;}\n",
                mode: "javascript",
            });
        });
        return grp;
    }();
    grpStart.appendTo(bd);
    grpStart.hide().fadeIn(1000);







    //---------底部ICP备案-----------
    $('<style>a:link,a:visited{text-decoration:none} a:hover{text-decoration:none}</style>').appendTo(bd)
    var icpdiv = $('<div style="font-size:12px;color:#666;text-align:center"></div').appendTo(bd);
    icpdiv.css({
        'position': 'absolute',
        'bottom': '10px',
        'text-align': 'center',
        'width': '100%',
    })
    $('<a href="http://www.miitbeian.gov.cn">[苏ICP备15036923号-2]</a>').appendTo(icpdiv);
});
