/*外部库设置*/
require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min'
    },
});

/*实际函数运行*/
require(['jquery'], function ($) {
    var bd = $('#_pieLocator');
    var pietop = $('<div style="margin:16px"></div>').appendTo(bd);
    pietop.append($('<a href="' + $('#_pieLocator').attr('pieUrl') + '"><h1 style="margin:0">PIE:Sample</h1></a>'));
    pietop.append($('<div>公共接口的示例</div><br>'));
    $('#_pieTemp').remove();


    /*获取上传文件的uploadtoken*/
    function getUploadToken(resdiv) {
        /*生成文件*/
        $.post("../api/getUploadToken", function (res) {
            var resstr = JSON.stringify(res);
            resdiv.html(resstr);
        });
    };
    var grpUploadToken = function () {
        var grp = $('<div style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取上传文件的uploadToken[../api/getUploadToken]</h3>'));

        grp.btn = $('<button style="padding:8px 16px">点击获取</button>').appendTo(grp);

        grp.append($('<br><label>res:</label>'));
        grp.resdiv = $('<div>...</div>').appendTo(grp);

        grp.btn.click(function () {
            getUploadToken(grp.resdiv);
        });

        return grp;
    }();




    /*上传一个字符串作为文件;
    str上传的文字；ext文件的后缀名如'js';
    */
    function uploadStr(data, resdiv) {
        /*生成文件*/
        $.post("../api/uploadData", data, function (res) {
            var url = encodeURI(res.data.url);
            var resstr = JSON.stringify(res);
            resdiv.html(resstr + '<br><a href="' + url + '" target="_blank">' + url + '</a>');
        });
    };

    /*上传一个字符串存储为文件*/
    var grpUploadStr = function () {
        var grp = $('<div style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>上传字符串存储为文件[../api/uploadData]</h3>'))

        grp.append($('<label>file:</label>'));
        grp.fileIpt = $('<input>').appendTo(grp);

        grp.append($('<br><label>data:</label>'));
        grp.dataTa = $('<textarea></textarea>').appendTo(grp);

        grp.btn = $('<br><button style="padding:8px 16px">保存为文件</button>').appendTo(grp);

        grp.append($('<br><label>res:</label>'));
        grp.resdiv = $('<div>...</div>').appendTo(grp);

        grp.btn.click(function () {
            uploadStr({
                data: grp.dataTa.val(),
                file: grp.fileIpt.val(),
            }, grp.resdiv);
        });

        return grp;
    }();


    bd.append($('<div style="margin:120px"></div>'))

    //end
});
