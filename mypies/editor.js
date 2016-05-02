/*外部库设置*/
require.config({
    paths: {
        jquery: '//' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        piejs: '//' + window.location.host + '/lib/piejs/0.1.1/piejs',
        cm: '//' + window.location.host + '/lib/codemirror/5.12.0',
    },
    map: {
        '*': {
            'css': '//' + window.location.host + '/lib/require-css/0.1.8/css.min.js',
        }
    },
    shim: {
        jquery: {
            deps: ['css!//' + window.location.host + '/lib/codemirror/5.12.0/lib/codemirror.css',
                   'css!//' + window.location.host + '/lib/codemirror/5.12.0/addon/hint/show-hint.css']
        },
    },
});

var modarr = ['jquery',
              'piejs',
              'cm/lib/codemirror',
              'cm/addon/hint/show-hint',
              'cm/addon/hint/javascript-hint',
              'cm/mode/javascript/javascript'];


require(modarr, function ($, piejs, CodeMirror) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.remove();

    //获取当前用户基本信息
    var usrProfile;
    $.post('../api/getMyProfile', function (msg) {
        if (msg && msg.code == 1) {
            usrProfile = msg.data;
        };
    });

    //获取地址栏参数
    var appname = piejs.getUrlParam('pieName');
    var authid = piejs.getUrlParam('pieUid');


    //按钮组
    var appurl;
    var btngrp = function () {
        var grp = $('<div id="btngrp" style="margin:8px 0"></div>').appendTo(bd);

        //保存按钮
        var savebtn = $('<button style="padding:4px 8px">保存</button>').appendTo(grp);
        grp.saveBtn = savebtn;
        savebtn.css('margin-right', '6px');
        savebtn.hide();

        savebtn.click(function () {
            //计算文件key
            if (appurl && usrProfile) {
                var uid = usrProfile.id;
                var urlpre = 'http://files.jscodepie.com/' + uid + '/';
                if (appurl.indexOf(urlpre) == 0) {
                    var file = appurl.substr(urlpre.length);
                    var data = {
                        data: editor.doc.getValue(),
                        file: file,
                    };
                    tipdiv.show().html('uploading...')
                    $.post("../api/uploadData", data, function (res) {
                        tipdiv.show().html('upload ok!');
                        tipdiv.fadeOut(1000, function () {
                            //向所有从属端发送更新命令
                            for (var attr in piejs.sktFamily) {
                                var sinfo = piejs.sktFamily[attr];
                                if (sinfo.state == undefined || sinfo.state == 1) {
                                    var dat = {
                                        tarSid: sinfo.sid,
                                        tarApi: '_runCmd',
                                        data: {
                                            cmd: 'location.reload()',
                                        },
                                        id: piejs.uniqueId(),
                                        time: Number(new Date()),
                                    };
                                    piejs.sktio.emit('transSmsg', dat);
                                };
                            };
                        });
                    });
                } else {
                    alert('File path err:' + appurl);
                };
            };
        });

        //预览按钮，新窗口打开，editorSid='',autoReload=true
        var previewA = $('<a target="_blank"></a>').appendTo(grp);
        var previewBtn = $('<button style="padding:4px 8px">预览</button>').appendTo(previewA);
        grp.previewA = previewA;
        previewA.css('margin-right', '12px');
        previewA.hide();

        piejs.sktio.afterCheckinFnArr.push(function () {
            var sinfo = piejs.sktio.sktInfo;
            var prevurl = appname + '?parentSid=' + sinfo.sid + '&autoCmd=true';
            previewA.attr('href', prevurl);
        });

        //app名称
        grp.titleSpan = $('<span style="color:#888"></span>').appendTo(grp);
        grp.apptitle = $('<span>...</span>').appendTo(grp.titleSpan);
        grp.appurl = $('<span>...</span>').appendTo(grp.titleSpan);

        grp.apptitle.html('[ ' + appname + ' ]');

        return grp;
    }();

    //错误提示行
    var tipdiv = $('<div style="color:#D00;font-size:14px">...</div>').appendTo(bd);
    tipdiv.hide();


    //编辑器,alt键hint
    var codeta = $('<textarea id="code">...loading...</textarea>').appendTo(bd);
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        mode: 'javascript',
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        lineWrapping: false,
        extraKeys: {
            "Alt": function (cm) {
                CodeMirror.showHint(cm, CodeMirror.hint.javascript);
            },
        },
    });

    //调整codemirror样式
    $('<style>.CodeMirror{height:auto}</style>').appendTo(bd);

    //先获取目标app的js文件路径，
    var tarapi = '../api/getPieInfoByPuidPnm?name=' + appname;
    if (authid) tarapi += '&uid=' + authid;

    $.post(tarapi, function (msg) {
        if (msg.code != 1) throw Error('getPieInfoByPuidPnm failed:' + msg.text);
        //如果是author，显示savebtn
        if (piejs.usrPower[msg.data.power] >= piejs.usrPower.author) {
            btngrp.saveBtn.show();
            btngrp.previewA.show();
            btngrp.titleSpan.css('color', '#000');
        };

        //然后载入目标的jsapp文件，请求时强制七牛刷新
        appurl = msg.data.url;
        btngrp.appurl.html('[ ' + appurl + ' ]');
        var urlts = appurl + '?ts=' + Number(new Date());
        $.get(urlts, function (dat) {
            editor.doc.setValue(dat);
        }, 'text').error(function (err) {
            tipdiv.show();
            tipdiv.html('Load failed:' + JSON.stringify(err));
        });
    });


});




//
