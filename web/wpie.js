/*jscodepie官方web函数库
推荐每个pie都调用
 */

require.config({
    paths: {
        jquery: '//cdn.bootcss.com/jquery/2.2.1/jquery.min',
        jform: '//cdn.bootcss.com/jquery.form/3.51/jquery.form.min.js',
        plupload: '//cdn.bootcss.com/plupload/2.1.7/plupload.full.min',
        qiniu: '//' + window.location.host + '/web/qiniu',
    },
});

define(function () {

    /*
    var $ = require('jquery');
    var jform = require('jform');
    var plupload = require('plupload');
    var qiniuu = require('qiniu');

    var wpie = {};

    /*七牛文件上传, 使用标准的plupload插件
    btnid页面上按钮元素的id
    */
    wpie.setUploadBtn = setUploadBtn;

    _webfns.setUploadBtn = function (btnid, dropboxid, fnsobj) {
        var btnjo = $('#' + btnid);
        btnjo.click(function () {
            if (qnUploadToken) {
                upload2qiniu();
            } else {
                _webfns.logr('ERR', '获取上传授权失败，请刷新后重试');
            };
        });





        return fnsobj;
    };

    function uploadToQiniu(uptoken, fnsobj) {
        //创建隐身表单
        var bd = $('body');
        var tmpnm = '_qnUploadTmp' + Math.random;
        var divtmp = $('<div id=' + tmpnm + ' style="display:block"></div>').appendTo(bd);

        var fm = $('<form method="post" action="http://upload.qiniu.com/" enctype="multipart/form-data"></form>');
        var ipttoken = $('<input name="token" type="hidden">').attr('value', uptoken);
        var iptfile = $('<input name="file" type="file">');
        var btnsumbit = $('<input  type="submit">');
        fm.append(ipttoken, iptfile, btnsumbit);
        fm.appendTo(divtmp);

        iptfile.change(function () {
            var options = {
                success: okfn, //处理完成
                dataType: 'json'
            };

            function okfn(fileinfo) {
                fileinfo.domain = _cfg.qiniu.pubBucketDomain;
                fileinfo.url = fileinfo.domain + fileinfo.hash;
                if (fnsobj.okfn) fnsobj.okfn(fileinfo);
                divtmp.remove();
            };

            fm.ajaxSubmit(options); //提交
        });

        iptfile.focus();
        iptfile.click();
    };







    function setUploadBtn2(btnid, pareid, dropid) {
        var usedrop = (dropid && dropid != '') ? true : false;
        var tkurl = '../api/getUploadToken';

        var uploader = Qiniu.uploader({
            runtimes: 'html5,html4', //上传模式,依次退化
            browse_button: btnid, //上传选择的点选按钮，**必需**
            uptoken_url: tkurl, //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
            domain: 'http://files.jscodepie.com/', //bucket 域名，下载资源时用到，**必需**
            get_new_uptoken: true, //设置上传文件的时候是否每次都重新获取新的token
            container: pareid, //上传区域DOM ID，默认是browser_button的父元素，
            max_file_size: '100mb', //最大文件体积限制
            max_retries: 0, //上传失败最大重试次数
            dragdrop: usedrop, //开启可拖曳上传
            drop_element: dropid, //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
            chunk_size: '4mb', //分块上传时，每片的体积
            auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传,
            init: {
                'FilesAdded': function (up, files) {
                    plupload.each(files, function (file) {
                        // 文件添加进队列后,处理相关的事情
                        tkurl += '?file=' + 'a' + file.name;
                        console.log('>>>>>add', file.name);
                    });
                },
                'BeforeUpload': function (up, file) {
                    // 每个文件上传前,处理相关的事情
                },
                'UploadProgress': function (up, file) {
                    // 每个文件上传时,处理相关的事情
                },
                'FileUploaded': function (up, file, info) {
                    // 每个文件上传成功后,处理相关的事情
                    console.log('>>>FileUploaded up', up);
                    console.log('>>>FileUploaded file', file);
                    console.log('>>>FileUploaded info', info);
                },
                'Error': function (up, err, errTip) {
                    //上传出错时,处理相关的事情
                },
                'UploadComplete': function () {
                    //队列文件处理完毕后,处理相关的事情
                },
                'Key': function (up, file) {
                    var key = '4/' + file.name;
                    return key;
                }
            }
        });
    };


    return wpie;
});
