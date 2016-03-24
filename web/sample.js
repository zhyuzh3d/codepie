/*外部库设置*/
require.config({
    paths: {
        wpie: '//' + window.location.host + '/web/wpie',
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min',
        jform: '//cdn.bootcss.com/jquery.form/3.51/jquery.form.min',
        qiniu: '//' + window.location.host + '/web/qiniu',
    },
});



/*实际函数运行*/
define(['jquery', 'jform', 'qiniu'], function ($, jform, qiniu) {
    var host = window.location.host;

    /*标题*/
    var bd = $('#_pieLocator');
    var pietop = $('<div style="margin:16px"></div>').appendTo(bd);
    pietop.append($('<a href="' + $('#_pieLocator').attr('pieUrl') + '"><h1 style="margin:0">PIE:Sample</h1></a>'));
    pietop.append($('<div>公共接口的示例</div><br>'));
    $('#_pieTemp').remove();











    /*使用邮箱登陆*/
    var grpLoginByMail = function () {
        var grp = $('<div id="grpLoginByMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>使用邮箱登陆[../api/loginByMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/loginByMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('286052520@qq.com').appendTo(fm);
        $('<label>pw</label>').appendTo(fm);
        var pw = $('<input name="pw">').val('zhyuzh').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击登陆</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('loginByMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();





    /*向邮箱发送重置密码的接口*/
    var grpSendResetPwToMail = function () {
        var grp = $('<div id="grpSendResetPwToMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>向邮箱发送重置密码的接口[../api/sendResetPwToMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/sendResetPwToMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('286052520@qq.com').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">发送重置密码</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('sendResetPwToMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();



    /*修改邮箱密码的接口*/
    var grpChangePw = function () {
        var grp = $('<div id="grpChangePw" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>修改邮箱密码接口[../api/changePw]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/changePw');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('286052520@qq.com').appendTo(fm);
        $('<label>orgPw</label>').appendTo(fm);
        var orgpw = $('<input name="orgPw">').val('zhyuzh').appendTo(fm);
        $('<label>newPw</label>').appendTo(fm);
        var newpw = $('<input name="newPw">').val('zhyuzh').appendTo(fm);
        var isrst = $('<input type="checkbox" name="isRest">').attr('checked', true).appendTo(fm);
        $('<span>重置密码</span>').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击修改</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('bindMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();




    /*通过邮箱获得注册获取验证码*/
    var grpSendRegCodeToMail = function () {
        var grp = $('<div id="grpSendRegCodeToMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获得邮箱注册验证码的接口[../api/sendRegCodeToMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/sendRegCodeToMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('286052520@qq.com').appendTo(fm);
        var resendchk = $('<input type="checkbox" name="resend">').attr('checked', true).appendTo(fm);
        $('<span>重新发送</span>').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击发送验证码</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('sendRegCodeToMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();


    /*绑定邮箱，需要注册验证码*/
    var grpBindMail = function () {
        var grp = $('<div id="grpBindMail" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>绑定邮箱到当前用户[../api/bindMail]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/bindMail');
        $('<label>mail</label>').appendTo(fm);
        var mailipt = $('<input name="mail">').val('286052520@qq.com').appendTo(fm);
        var regCodeipt = $('<input name="regCode">').appendTo(fm);
        var pwipt = $('<input name="pw">').val('zhyuzh').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击绑定</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);


        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('bindMail', res);
                    resdiv.html(JSON.stringify(res));
                },
            });
        });

        return grp;
    }();

    /*创建App（pie）的接口*/
    var grpCreatePie = function () {
        var grp = $('<div id="grpCreatePie" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>创建pieApp的接口[../api/createPie]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/createPie');
        $('<label>name</label>').appendTo(fm);
        var pathipt = $('<input name="name">').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击创建一个pie应用</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resa = $('<a target="_blank"></a>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);


        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    console.log('createpie', res);
                    resdiv.html(JSON.stringify(res));
                    if (res.code == 1) {
                        resa.html(res.data.url);
                        resa.attr('href', res.data.url);
                    };
                },
            });
        });

        return grp;
    }();




    /*获取文件列表*/
    var grpGetFileList = function () {
        var grp = $('<div id="grpGetFileList" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取文件列表的接口[../api/getFileList]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getFileList');
        $('<label>path</label>').appendTo(fm);
        var pathipt = $('<input name="path">').appendTo(fm);
        $('<label>limit</label>').appendTo(fm);
        var limitipt = $('<input name="limit">').val(2).appendTo(fm);
        $('<label>marker</label>').appendTo(fm);
        var markipt = $('<input name="marker">').val('').appendTo(fm);
        var sendbtn = $('<button style="padding:8px 16px">点击获取文件列表</button>').appendTo(grp);

        $('<br><label>RES:</label><br>').appendTo(grp);
        var resul = $('<ul></ul>').appendTo(grp);
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                type: 'POST',
                success: function (res) {
                    var resobj = res;
                    markipt.val(resobj.marker);
                    resdiv.html(JSON.stringify(res));
                    resul.empty();
                    resobj.items.forEach(function (one, i) {
                        var li = $('<li></li>').appendTo(resul);
                        var furl = resobj.domain + one.key;
                        li.html('<a target="_blank" href="' + furl + '">' + furl + '</a>');
                    });
                },
            });
        });

        return grp;
    }();




    /*直接上传一个文件*/
    var grpUploadFile = function () {
        var grp = $('<div id="grpUploadFile" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>上传文件方法,使用uploadToken接口[../api/getUploadToken]</h3>'))

        var fm = $('<form method="post" action="http://upload.qiniu.com/" enctype="multipart/form-data"></form>');
        $('<label>file</label>').appendTo(fm);
        var iptfile = $('<input name="file" type="file">').appendTo(fm);
        $('<label>token</label>').appendTo(fm);
        var ipttoken = $('<input name="token" type="">').attr('value', '...').appendTo(fm);
        $('<label>key</label>').appendTo(fm);
        var iptkey = $('<input name="key" type="">').attr('value', '...').appendTo(fm);
        $('<br><br>RES:<br>').appendTo(fm);
        var reslink = $('<a>...</a>').appendTo(fm);
        fm.appendTo(grp);

        var resdiv = $('<div id="myResultsDiv"></div>').appendTo(grp);
        iptfile.on('change', function () {
            var furl = iptfile.val();
            if (furl == '' || !furl) return;

            //获取uploadtoken并填充ipttoken
            var api = "../api/getUploadToken?fpath=" + furl.substring(furl.lastIndexOf('\\') + 1);
            $.post(api, function (res) {
                //上传文件
                ipttoken.val(res.data.uptoken);
                iptkey.val(res.data.key);
                fm.ajaxSubmit({
                    type: 'POST',
                    success: function (fileinfo) {
                        fileinfo.domain = res.data.domain;
                        fileinfo.url = fileinfo.domain + res.data.key;
                        reslink.html(fileinfo.url);
                        reslink.attr('href', fileinfo.url);
                    },
                });
            });
        });
        return grp;
    }();




    /*获取上传文件的uploadtoken
    form必须是enctype="text/plain"
    */
    var grpUploadToken = function () {
        var grp = $('<div id="grpUploadToken" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>获取上传文件的接口[../api/getUploadToken]</h3>'));

        var fm = $('<form method="post" enctype="text/plain"></form>').appendTo(grp);
        fm.attr('action', '../api/getUploadToken');
        $('<label>fpath</label>').appendTo(fm);
        var iptfile = $('<input name="fpath">').appendTo(fm);

        var sendbtn = $('<button style="padding:8px 16px">点击获取上传token</button>').appendTo(grp);

        grp.append($('<br><br><label>RES:</label>'));
        var resdiv = $('<div>...</div>').appendTo(grp);

        sendbtn.click(function (e) {
            fm.ajaxSubmit({
                success: function (res) {
                    var resstr = JSON.stringify(res);
                    resdiv.html(resstr);
                },
            });
        })

        return grp;
    }();



    /*上传一个字符串作为文件;
    str上传的文字；ext文件的后缀名如'js'
    上传一个字符串存储为文件
    */
    var grpUploadStr = function () {
        var grp = $('<div id="grpUploadStr" style="margin:16px"></div>').appendTo(bd);
        grp.append($('<hr>'));
        grp.append($('<h3>上传字符串存储为文件[../api/uploadData]</h3>'))

        grp.append($('<label>file:</label>'));
        grp.fileIpt = $('<input>').appendTo(grp);

        grp.append($('<label>data:</label>'));
        grp.dataTa = $('<textarea></textarea>').appendTo(grp);

        grp.btn = $('<br><br><button style="padding:8px 16px">保存为文件</button>').appendTo(grp);

        grp.append($('<br><label>RES:</label>'));
        var resdiv = $('<div>...</div>').appendTo(grp);

        grp.btn.click(function () {
            var data = {
                data: grp.dataTa.val(),
                file: grp.fileIpt.val(),
            };
            $.post("../api/uploadData", data, function (res) {
                console.log("../api/uploadData", res);
                var url = encodeURI(res.data.url);
                var resstr = JSON.stringify(res);
                resdiv.html(resstr + '<br><a href="' + url + '" target="_blank">' + url + '</a>');
            });
        });

        return grp;
    }();

    //底部空间
    bd.append($('<div style="margin:16px 0 120px 16px"><hr><br>Create by jscodepie</div>'))

    //end
});
