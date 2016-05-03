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
    $('body').css('margin', '0');
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
        var grp = $('<div id="btngrp"></div>').appendTo(bd);
        grp.css({
            'position': 'fixed',
            'top': '0',
            'padding': '8px',
            'background': '#EEE',
            'height': '24px',
            'width': '100%',
            'z-index': '99',
            'border-bottom': '1px solid #CCC'
        })

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
                        data: editorGrp.editor.doc.getValue(),
                        file: file,
                    };
                    grp.tipdiv.show().html('uploading...')
                    $.post("../api/uploadData", data, function (res) {
                        grp.tipdiv.show().html('upload ok!');
                        grp.tipdiv.fadeOut(1000, function () {
                            console.log('>>>prepare skt', piejs.sktFamily.length);
                            //向所有从属端发送更新命令
                            for (var n = 0; n < piejs.sktFamily.length; n++) {
                                var sinfo = piejs.sktFactory[piejs.sktFamily[n]];
                                console.log('>>>prepare skt', sinfo);
                                if (sinfo && sinfo.state == 1) {
                                    var dat = {
                                        tar: sinfo,
                                        api: '_runCmd',
                                        data: {
                                            cmd: 'location.reload()',
                                        },
                                        id: piejs.uniqueId(),
                                        time: Number(new Date()),
                                    };
                                    console.log('>>>send cmd', dat);
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
            //var prevurl = appname + '?parentSid=' + sinfo.sid + '&autoCmd=true';
            var prevurl = appname + '?parentUid=' + sinfo.uid + '&parentPid=' + sinfo.pid + '&autoCmd=true';
            previewA.attr('href', prevurl);
        });

        //app名称
        grp.titleSpan = $('<span style="color:#888"></span>').appendTo(grp);
        grp.apptitle = $('<span>...</span>').appendTo(grp.titleSpan);
        grp.appurl = $('<span>...</span>').appendTo(grp.titleSpan);

        grp.apptitle.html('[ ' + appname + ' ]');

        //错误提示行
        var tipdiv = grp.tipdiv = $('<div style="color:#D00;font-size:14px">..up;loading.</div>').appendTo(grp);
        tipdiv.css({
            'background': '#94EE77',
            'padding': '4px 8px',
            'color': '#164',
            'margin-left': '-8px',
            'margin-top': '12px'
        })
        tipdiv.hide();

        return grp;
    }();




    //---------编辑器部分
    var editorGrp = function () {
        var grp = $('<div id="editorGrp"></div>').appendTo(bd);
        grp.css({
            'margin-top': '40px',
            'z-index': 0,
        });



        //编辑器,alt键hint
        var codeta = grp.ta = $('<textarea id="code">...loading...</textarea>').appendTo(grp);
        var editor = grp.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
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
                editorGrp.editor.doc.setValue(dat);
            }, 'text').error(function (err) {
                btngrp.tipdiv.show();
                btngrp.tipdiv.html('Load failed:' + JSON.stringify(err));
            });
        });
        return grp;
    }();


});




//
