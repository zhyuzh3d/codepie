/*外部库设置*/
require.config({
    paths: {
        //jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min',
        jquery: '../../lib/jquery/2.2.1/jquery.min',
        cm: '../../lib/codemirror/5.12.0',
    },
    map: {
        '*': {
            //'css': 'http://cdn.bootcss.com/require-css/0.1.8/css.min.js',
            'css': '../../lib/require-css/0.1.8/css.min',
        }
    },
    shim: {
        jquery: {
            deps: ['css!../lib/codemirror/5.12.0/lib/codemirror.css',
                   'css!../lib/codemirror/5.12.0/addon/hint/show-hint.css']
        },
    },
});

var modarr = ['jquery',
              'cm/lib/codemirror',
              'cm/addon/hint/show-hint',
              'cm/addon/hint/javascript-hint',
              'cm/mode/javascript/javascript'];


require(modarr, function ($, CodeMirror) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.remove();

    //按钮组
    var btngrp = function () {
        var grp = $('<div id="btngrp" style="margin:8px 0"></div>').appendTo(bd);

        //保存按钮
        var savebtn = $('<button style="padding:4px 8px;margin-right:12px">保存</button>').appendTo(grp);


        //app名称
        grp.apptitle = $('<span>...</span>').appendTo(grp);
        grp.appurl = $('<span>...</span>').appendTo(grp);

        return grp;
    }();


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


    //获取地址栏参数
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };
    var appname = $.getUrlParam('pieName');
    btngrp.apptitle.html('[ ' + appname + ' ]');
    var authid = $.getUrlParam('authorId');
    if (!authid) authid = 1;

    //先获取目标app的js文件路径，然后载入目标app文件
    var tarapi = '../api/getPieInfo?name=' + appname + '&authorId=' + authid;
    $.post(tarapi, function (msg) {
        if (msg.code != 1) throw Error('GetPieInfo failed:' + msg.text);

        var appurl = msg.data.url;
        btngrp.appurl.html('[ ' + appurl + ' ]');

        $.get(appurl, function (dat) {
            editor.doc.setValue(dat);
            codeta.html(dat);
        });
    })



});




//
