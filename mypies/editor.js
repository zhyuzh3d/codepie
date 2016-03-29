/*外部库设置*/
require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min',
    },
    packages: [{
        name: "codemirror",
        location: "../lib/codemirror/",
        main: "lib/codemirror",
    }],
    map: {
        '*': {
            'css': 'http://cdn.bootcss.com/require-css/0.1.8/css.min.js',
        }
    },
    shim: {
        jquery: {
            deps: ['css!../lib/codemirror/lib/codemirror.css']
        }
    },
});


require(['jquery', 'codemirror', '../lib/codemirror/mode/javascript/javascript.js'], function ($, CodeMirror) {
    var bd = $('#pieBox');
    var tmp = bd.children('#_pieTemp');
    tmp.remove();
    $('<textarea id="code">this is text in ta.\nNext line.</textarea>').appendTo(bd);

    //编辑器测试
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true
    });

    //主题颜色??

    //代码提示??



});
