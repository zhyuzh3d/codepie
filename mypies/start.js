/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
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
require(['jquery', 'bootstrap', 'swal', 'toastr'], function ($, bootstrap, swal, toastr) {
    var pieBox = $('#pieBox');
    pieBox.attr('class', 'row');
    pieBox.css('margin', '0');
    var tmp = pieBox.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
        genNavbar().prependTo(pieBox);
    });

    var topNavbar;
    var genNavbar = function () {
        var navbar = $('<div class="row breadcrumb" style="margin:0;border-radius:0"></div>');
        var backbtn = $('<li class="btn" style="padding:0">返回</li>').appendTo(navbar);
        var homebtn = $('<li class="btn" style="padding:0">首页</li>').appendTo(navbar);
        var refreshbtn = $('<li class="btn" style="padding:0">我的应用列表</li>').appendTo(navbar);
        backbtn.click(function () {
            window.location.href = document.referrer;
        });
        homebtn.click(function () {
            window.location.href = 'http://' + location.host + '/pie/welcome';
        });
        refreshbtn.click(function () {
            location.reload();
        });

        return navbar;
    };

    var grpStart = function () {
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">')

        //layout
        var pieGrp = $('<div id="pieGrp" class="container col-sm-12 col-md-10 col-md-offset-1"></div>').appendTo(pieBox);
        pieGrp.css('padding', '0 1em');

        //title
        var tipGrp = $('<div style="margin-top:1em"></div>').appendTo(pieGrp);
        $('<div style="color:#888">您可以使用 <span class="glyphicon glyphicon-plus"></span> 创建，使用 <span class="glyphicon glyphicon-remove"></span> 删除，或者 <span class="glyphicon glyphicon-fire"></span> 运行或 <span class="glyphicon glyphicon-pencil"></span> 编辑</div>').appendTo(tipGrp);

        //addbtn
        var btnsGrp = $('<div style="margin-top:1em"></div>').appendTo(pieGrp);
        var addBtn = $('<div class="btn btn-success"> 创建新应用</div>').appendTo(btnsGrp);
        $('<span class="glyphicon glyphicon-plus"></span>').prependTo(addBtn);
        addBtn.click(function () {
            //弹出输入名称的窗口
            swal({
                title: "请输入应用名称",
                text: 'Write something interesting:',
                type: 'input',
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top"
            }, function (val) {
                //创建pie
                if (val === false) return;
                var api = 'http://' + location.host + '/api/createPie';
                var dt = {
                    name: val,
                };
                $.post(api, dt, function (res) {
                    console.log('POST', api, dt, res);
                    if (res.code != 1) {
                        toastr.error(res.text);
                    } else {
                        toastr.info('创建成功')
                        refreshLst();
                    };
                });
            });
        });


        //list
        var lstGrp = $('<div class="row" style="min-height:300px;margin-top:1em"></div>').appendTo(pieGrp);

        //new one panle
        $('<style>.pnlBtn{color:red;float:right}</style>').appendTo(pieBox);

        function newPanel(pinfo) {
            var grp = $('<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6"></div>');
            grp.css('padding', '0.2em 1em');

            var pnl = $('<div class="panel panel-default"></div>').appendTo(grp);
            pnl.css({
                'margin-bottom': '0',
                'line-height': '2em',
            });
            var bd = $('<div class="panel-body row" style="padding:1em 2em"></div>').appendTo(pnl);
            var nm = $('<div>' + pinfo.name + '</div>').appendTo(bd);
            nm.css({
                'display': 'inline-block',
                'overflow-x': 'hidden',
                'text-overflow': 'ellipsis',
                'width': '50%',
                'white-space': 'nowrap',
            })

            var pbtngrp = $('<div class="btn-group pull-right" role="group"></div>').appendTo(bd);

            //runbtn
            var tarPieUrl = 'http://' + location.host + '/pie/' + pinfo.uid + '/' + pinfo.name;
            var runA = $('<a type="button" class="btn btn-default">run</a>').appendTo(pbtngrp);
            runA.attr('href', tarPieUrl);
            runA.html('<span class="glyphicon glyphicon-fire"></span>');

            //editbtn
            var tarEditUrl = 'http://' + location.host + '/pie/editor';
            tarEditUrl += '?puid=' + pinfo.uid + '&pname=' + pinfo.name;
            var editA = runA.clone().appendTo(pbtngrp);
            editA.attr('href', tarEditUrl);
            editA.html('<span class="glyphicon glyphicon-pencil"></span>');

            //delbtn
            var delBtn = $('<button type="button" class="btn btn-default">run</button>').appendTo(pbtngrp);
            delBtn.html('<span class="glyphicon glyphicon-remove"></span>');
            delBtn.click(function () {
                //弹窗提示确认
                swal({
                    title: '［' + pinfo.name + '］',
                    text: "删除后不可恢复，您确定要删除吗？",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "删除",
                    cancelButtonText: "取消",
                }, function (val) {
                    if (val) {
                        //执行请求
                        var api = 'http://' + location.host + '/api/setPieStateByPid';
                        var dt = {
                            id: pinfo.id,
                            state: -1
                        };
                        $.post(api, dt, function (res) {
                            console.log('POST', api, dt, res);
                            if (res.code != 1) {
                                toastr.error(res.text);
                            } else {
                                toastr.info('删除成功')
                                refreshLst();
                            };
                        });
                    };
                });
            });

            grp.attr('pid', pinfo.id);
            grp.id = pinfo.id;
            return grp;
        };

        //fill all list
        function fillLst(piearr) {
            lstGrp.empty();
            //反序
            piearr.sort(function (o, p) {
                return (Number(o.id) > Number(p.id)) ? -1 : 1;
            });
            piearr.forEach(function (one, i) {
                if (one.state == 1) newPanel(one).appendTo(lstGrp);
            });
        };

        //post
        function refreshLst() {
            var api = 'http://' + location.host + '/api/getPieList';
            $.post(api, {}, function (res) {
                console.log('POST', api, undefined, res);
                if (res.code == 1) {
                    var pieArr = res.data.pieArr;
                    fillLst(pieArr);
                } else {
                    toastr.error(res.text);
                };
            });
        };
        refreshLst();

        return pieGrp;
    }();
    grpStart.appendTo(pieBox);
    grpStart.hide().fadeIn(1000);

    //bottom
    var botGrp = $('<div class="col-md-12">- Powered by jscodepie.com -</div>').appendTo(pieBox);
    botGrp.css({
        'text-align': 'center',
        'color': '#AAA',
        'margin': '2em 0',
        'font-size': '0.8em'
    })

});
