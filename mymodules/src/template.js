/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        soketio: '//' + window.location.host + '/lib/socket.io/1.4.5/socket.io.min',
        piejs: 'http://' + window.location.host + '/lib/piejs/0.1.1/piejs',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
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
        swal: {
            deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
        },
        toastr: {
            deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
        },
    },
});


/*实际函数运行*/
require(['jquery', 'bootstrap', 'soketio', 'piejs', 'swal', 'toastr'], function ($, bootstrap, soketio, piejs, swal, toastr) {
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');

    var pieBox = $('#pieBox');
    pieBox.attr('class', 'row');
    pieBox.css('margin', '0');
    var _pieTemp = pieBox.children('#_pieTemp');
    _pieTemp.fadeOut(200, function () {
        _pieTemp.remove();
        if (pieMain != undefined && pieMain.constructor == Function) {
            //运行主函数
            var appui;
            try {
                appui = pieMain();
            } catch (err) {
                console.error('>运行主函数出错：', err);
            };

            //添加官方界面
            if (piejs && piejs.initPie) {
                piejs.initPie();
            };
        };
    });

    function pieMain() {
        //新手从这里开始，请勿删除此行
        //在下面编写代码，可以把界面元素添加到应用盒子appendTo(pieBox);
        //新手到这里结束，请勿删除此行
    };

});





//end
