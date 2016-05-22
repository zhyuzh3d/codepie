/*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        piejs: 'http://' + window.location.host + '/lib/piejs/0.1.1/piejs',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        cm: 'http://' + window.location.host + '/lib/codemirror/5.12.0',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
        jform: 'http://' + window.location.host + '/lib/jquery.form/3.51/jquery.form.min',
    },
    map: {
        '*': {
            'css': 'http://' + window.location.host + '/lib/require-css/0.1.8/css.min.js',
        }
    },
    shim: {
        jquery: {
            deps: ['css!http://' + window.location.host + '/lib/codemirror/5.12.0/lib/codemirror.css',
                   'css!http://' + window.location.host + '/lib/codemirror/5.12.0/addon/hint/show-hint.css']
        },
        bootstrap: {
            deps: ['css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min.css',
                   'css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap-theme.min.css',
                 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min.js']
        },
        swal: {
            deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
        },
        toastr: {
            deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
        },
    },
});

var modarr = ['jquery',
              'piejs',
              'swal',
              'toastr',
              'cm/lib/codemirror',
              'cm/addon/hint/show-hint',
              'cm/addon/hint/javascript-hint',
              'cm/mode/javascript/javascript',
              'bootstrap',
              'jform'
             ];


require(modarr, function ($, piejs, swal, toastr, CodeMirror) {
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');

    $('body').css('margin', '0');
    var pieBox = $('#pieBox');
    pieBox.attr('class', 'row');
    pieBox.css('margin', '0');
    var tmp = pieBox.children('#_pieTemp');
    tmp.fadeOut(200, function () {
        tmp.remove();
    });


    //获取当前用户基本信息
    var uinfo;
    $.post('../api/getMyProfile', function (msg) {
        if (msg && msg.code == 1) {
            uinfo = msg.data;
        };
    });

    //获取地址栏参数
    var appname = piejs.getUrlParam('pname');
    var authid = piejs.getUrlParam('puid');
    var fullappnm = authid + '/' + appname;
    if (appname) {
        $('head').find('title').html(appname + '-' + 'PieEditor');
    };


    //按钮组
    var appurl;

    var btngrp = function genbtngrp() {
        var grp = $('<nav class="navbar navbar-default navbar-fixed-top"></div>').appendTo(pieBox);
        var navctn = $('<div class="container col-xs-12 col-sm-12 col-md-12" style="white-space:nowrap;padding-left:0"></div>').appendTo(grp);

        //返回首页
        var hmlink = $('<a target="_blank" class="btn" style="margin-right:8px"> 返回</a>').appendTo(navctn);
        $('<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>').prependTo(hmlink);
        //hmlink.attr('href', '../pie/start');
        hmlink.click(function () {
            window.location.href = document.referrer;
        });

        //保存按钮
        var savebtn = $('<button class="btn btn-success navbar-btn btn-sm" style="margin-right:8px"> 保存</button>').appendTo(navctn);
        $('<span class="glyphicon glyphicon-save" aria-hidden="true"></span>').prependTo(savebtn);
        grp.saveBtn = savebtn;
        savebtn.hide();

        savebtn.click(function () {
            //计算文件key
            if (appurl && uinfo) {
                var uid = uinfo.id;
                var urlpre = 'http://files.jscodepie.com/' + uid + '/';
                if (appurl.indexOf(urlpre) == 0) {
                    var file = appurl.substr(urlpre.length);
                    var data = {
                        data: editorGrp.editor.doc.getValue(),
                        file: file,
                    };
                    grp.tipdiv.show().html('uploading...');
                    savebtn.attr('disabled', true);
                    $.post("../api/uploadData", data, function (res) {
                        grp.tipdiv.show().html('upload ok!');
                        savebtn.attr('disabled', false);
                        grp.tipdiv.fadeOut(500, function () {
                            //向所有从属端发送更新命令
                            for (var n = 0; n < piejs.sktFamily.length; n++) {
                                var sinfo = piejs.sktFactory[piejs.sktFamily[n]];
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
                                    piejs.sktio.emit('transSmsg', dat);
                                };
                            };
                        });
                    });
                } else {
                    swal({
                        type: 'warning',
                        title: '',
                        text: '文件路径错误,请返回首页重试',
                    });
                };
            };
        });

        //预览按钮，新窗口打开，parentUid='',parentPid='',autoReload=true
        var previewA = $('<a target="_blank" class="btn btn-primary navbar-btn btn-sm" style="margin-right:8px"> 预览</a>').appendTo(navctn);
        $('<span class="glyphicon glyphicon-fire" aria-hidden="true"></span>').prependTo(previewA);
        grp.previewA = previewA;
        previewA.hide();

        function setpreva() {
            var sinfo = piejs.sktio.sktInfo;
            var prevurl = fullappnm + '?parentUid=' + sinfo.uid + '&parentPid=' + sinfo.pid + '&autoCmd=true';
            previewA.attr('href', 'http://' + location.host + '/pie/' + prevurl);
        }
        if (piejs.sktio.hasCheckin) {
            setpreva();
        };
        piejs.sktio.afterCheckinFnArr.push(setpreva);


        //插入按钮
        var nstbtn = $('<button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#nstModal">  插入</button>').appendTo(navctn);
        $('<span class="glyphicon glyphicon-leaf" aria-hidden="true"></span>').prependTo(nstbtn);


        //插入弹窗modal
        var nstmd = $('<div class="modal" id="nstModal" role="dialog" aria-labelledby="myModalLabel"></div>').prependTo($('body'));
        var nstmddg = $('<div class="modal-dialog" role="document"></div>').appendTo(nstmd);
        var nstmdctn = $('<div class="modal-content"></div>').appendTo(nstmddg);

        var nstmdhd = $('<div class="modal-header"></div>').appendTo(nstmdctn);
        var nstmdcls = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>').appendTo(nstmdhd);
        var nstmdtt = $('<h4 class="modal-title" id="myModalLabel">插入元素</h4>').appendTo(nstmdhd);

        var nstmdbd = $('<div class="modal-body"></div>').appendTo(nstmdctn);

        //弹窗，插入图片按钮,插入文件按钮
        var nstmduploads = $('<div class=""></div>').appendTo(nstmdbd);
        var nstpicbtn = $('<a target="_blank" class="btn btn-success navbar-btn" style="margin-right:8px"><span class="glyphicon glyphicon-picture" aria-hidden="true"></span> 插入图片</a>').appendTo(nstmdbd);
        nstpicbtn.click(function () {
            iptfile.attr('accept', '.png,.jpg,.jpeg,.gif');
            iptfile.click();
        });
        var nstfilebtn = $('<a target="_blank" class="btn btn-success navbar-btn" style="margin-right:8px"><span class="glyphicon glyphicon-file" aria-hidden="true"></span> 插入图片</a>').appendTo(nstmdbd);
        nstfilebtn.click(function () {
            iptfile.attr('accept', '.js,.json,.xml,.html,.css,.txt,.zip,.rar,.pdf,.mp4,.mov');
            iptfile.click();
        });

        //弹窗，插入符号按钮,插入文件按钮
        var nstmdsigns = $('<div class=""></div>').appendTo(nstmdbd);
        var signarr = [];
        signarr.push(';\n', '.', ',', '$', 'br');
        signarr.push('\'', '\"', {
            sign: '(  )',
            cpos: 2
        }, {
            sign: '{  }',
            cpos: 2
        }, 'br');
        signarr.push('=', '==', '>', '<', '>=', '<=', 'br');
        signarr.push('?', ':', '&&', '||');

        signarr.forEach(function (s, i) {
            if (s == 'br') {
                nstmdsigns.append($('<br>'));
                return;
            };

            //兼容对象模式，调整指针位置倒退
            var str = s;
            var pos;
            if (s.cpos) {
                str = s.sign;
                pos = s.cpos;
            };

            var sbtn = $('<a target="_blank" class="btn btn-default navbar-btn" style="margin-right:8px"></a>').appendTo(nstmdsigns);
            sbtn.html('&nbsp;&nbsp;' + str + '&nbsp;&nbsp;');
            sbtn.click(function () {
                nstmdcls.click();
                editorGrp.editor.insertStr(str, pos);
            });
        });




        //插入按钮组隐身输入组
        var fm = $('<form method="post" action="http://upload.qiniu.com/" enctype="multipart/form-data"></form>');
        var iptfile = $('<input name="file" type="file"  accept=".png,.jpg,.jpeg,.gif">').appendTo(fm);
        var ipttoken = $('<input name="token" type="">').appendTo(fm);
        var iptkey = $('<input name="key" type="">').appendTo(fm);
        fm.appendTo(nstmdbd);
        fm.hide();
        iptfile.on('change', function () {
            var furl = iptfile.val();
            if (furl == '' || !furl) return;

            //获取uploadtoken并填充ipttoken,使用shortappname+filename
            var filenm = furl.substring(furl.lastIndexOf('\\') + 1);
            var fkey = appname + '/' + filenm;
            var api = "../api/getUploadToken?fpath=" + fkey;
            $.post(api, function (res) {
                //上传文件
                ipttoken.val(res.data.uptoken);
                iptkey.val(res.data.key);
                fm.ajaxSubmit({
                    type: 'POST',
                    success: function (fileinfo) {
                        fileinfo.domain = res.data.domain;
                        fileinfo.url = fileinfo.domain + res.data.key;
                        var url = fileinfo.domain + res.data.key;
                        editorGrp.editor.insertStr(url);
                    },
                });
            });
        });




        //app名称
        //grp.titleSpan = $('<span style="color:#888;"></span>').appendTo(navctn);
        //grp.appurl = $('<span>...</span>').appendTo(grp.titleSpan);

        //错误提示行
        var tipdiv = grp.tipdiv = $('<div style="color:#D00;font-size:0.75em">...</div>').appendTo(grp);
        tipdiv.css({
            'background': '#94EE77',
            'padding': '4px 8px',
            'color': '#164',
            'margin-left': '0px',
            'margin-top': '50px'
        });
        tipdiv.hide();

        return grp;
    }();



    //编辑器部分
    var editorGrp = function geneditorgrp() {
        var grp = $('<div id="editorGrp"></div>').appendTo(pieBox);;
        grp.css({
            'margin-top': '50px',
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

        //插入字符串的方法
        editor.insertStr = function (str, pos) {
            editor.doc.replaceSelection(str, 'around');
            var csrpos = editor.doc.getCursor('to');
            //调整后退鼠标位置
            if (pos) {
                csrpos = editor.doc.getCursor();
                csrpos.ch = csrpos.ch - pos;
            };
            editor.doc.setCursor(csrpos);
            editor.focus();
        };

        //调整codemirror样式
        $('<style>.CodeMirror{height:auto}</style>').appendTo(grp);

        //先获取目标app的js文件路径，
        var tarapi = 'http://' + location.host + '/api/getPieInfoByPuidPnm?name=' + appname;
        if (authid) tarapi += '&uid=' + authid;
        var epinfo;

        $.post(tarapi, function (msg) {
            if (msg.code != 1) {
                console.log('>getPieInfoByPuidPnm failed:' + msg.text);
                return;
            };

            epinfo = msg.data;

            //如果是author，显示savebtn
            if (piejs.usrPower[msg.data.power] >= piejs.usrPower.author) {
                btngrp.saveBtn.show();
                btngrp.previewA.show();
                //btngrp.titleSpan.css('color', '#000');
            };

            //然后载入目标的jsapp文件，请求时强制七牛刷新
            appurl = msg.data.url;
            //btngrp.appurl.html('[ ' + appurl + ' ]');
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
