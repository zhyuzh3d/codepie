/*提供七牛云端文件存储服务接口*/
var _qn = {};

/*相关设置,关键密匙在外部xcfg.json*/
var cfg = {
    Port: 19110,
    Uptoken_Url: "/uptoken",
    Domain: "http://qiniu-plupload.qiniudn.com/",
    BucketName: "jscodepie",
    BucketDomain: "http://files.jscodepie.com/"
};
_qn.cfg = cfg;

/*初始化设置,依赖xcfg*/
_cfg.xcfgCo().then(function (xcfg) {
    $qiniu.conf.ACCESS_KEY = xcfg.qiniu.ACCESS_KEY;
    $qiniu.conf.SECRET_KEY = xcfg.qiniu.SECRET_KEY;
    _app.httpSvr.listen(_qn.cfg.Port, function () {
        __infohdlr("qiniu:listening on port:" + _qn.cfg.Port);
    });
    return;
}).then(null, __errhdlr);



/*http接口：获取上传token的接口
存储锁定uid/...
每个用户单独的路径以用户id为编号，格式'../455/'
req:{fpath:'...'}
*/
_rotr.apis.getUploadToken = function () {
    var ctx = this;

    var co = $co(function* () {
        var uid = ctx.xdat.uid;
        var fpath = ctx.query.fpath || ctx.request.body.fpath;
        if (!fpath || fpath == '') throw Error('File cannot be undefeind!');

        //根据uid授权路径的token
        var key = ctx.xdat.uid + '/' + fpath;
        var token = _qn.genUploadToken(key);
        var respdat = {
            uid: ctx.xdat.uid,
            key: key,
            domain: _qn.cfg.BucketDomain,
            uptoken: token,
        };
        ctx.body = __newMsg(1, 'OK', respdat);
        ctx.xdat.uploadToken = token;
        return ctx;
    });
    return co;
};

/*生成uptoken的函数*/
_qn.genUploadToken = genUploadToken;

function genUploadToken(key) {
    var pubPutPolicy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName + ':' + key);
    pubPutPolicy.returnBody = '{"name": $(fname),"size": $(fsize),"type": $(mimeType),"color": $(exif.ColorSpace.val),"key":$(key),"w": $(imageInfo.width),"h": $(imageInfo.height),"hash": $(etag)}';
    var token = pubPutPolicy.token();
    return token;
};




/*获取文件夹列表
锁定用户的uid/folder路径
marker标识分页位置，即上一次显示到第几个
req:{path:'myfolder/subfolder/',limit:100,marker:'eyJjIjowLCJrIjoiM...'};
res:{}
*/
_rotr.apis.getFileList = function () {
    var ctx = this;

    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var prefix = uid + '/';
        var path = ctx.query.path || ctx.request.body.path;
        if (path && path != '') prefix += path;
        var limit = ctx.query.limit || ctx.request.body.limit;
        var marker = ctx.query.marker || ctx.request.body.marker;

        var res = yield _qn.getFileListCo(prefix, limit, marker);
        var bdobj = JSON.safeParse(res.body);
        bdobj.domain = _qn.cfg.BucketDomain;
        ctx.body = bdobj;
        return ctx;
    });
    return co;
};



/*单独函数，获取文件列表
prefix应该带uid，类似'4/myfolder/'
*/
_qn.getFileListCo = getFileListCo;

function getFileListCo(prefix, limit, marker) {
    var co = $co(function* () {
        var optpath = '/list?bucket=jscodepie&prefix=' + prefix;
        if (!limit) limit = 100;
        optpath += '&limit=' + limit;
        if (marker && marker != '') optpath += '&marker=' + marker;

        //根据uid授权路径的token
        var options = {
            hostname: 'rsf.qbox.me',
            port: 80,
            path: optpath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '',
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);

        var prms = _fns.httpReqPrms(options);

        var res = yield prms;

        return res;
    });
    return co;
};





/*http接口POST：上传字符串或数据，存储到七牛，返回文件url
自动覆盖已有文件，存储目录锁定/uid/...
req:{data,file};如果没有data则为空字符串，如果没有file则随机一个md5文件名;自动判断扩展名
res:{url:'bucketdomain/uid/file}
*/
_rotr.apis.uploadData = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var data = ctx.request.body.data || ctx.query.data;
        var file = ctx.request.body.file || ctx.query.file;

        var filekey = uid + '/';
        (file) ? filekey += file: filekey += __md5();

        var res = yield _qn.uploadDataCo(data, filekey);
        if (!res || !res.key) throw Error('Upload data failed,cannot get url');

        ctx.xdat.uploadData = res;
        ctx.body = __newMsg(1, 'ok', {
            url: _qn.cfg.BucketDomain + res.key,
        });
        return ctx;
    });
    return co;
};


/*单独函数uploaddata
返回七牛的结果*/
_qn.uploadDataCo = uploadDataCo;

function uploadDataCo(dat, filekey, extra) {
    var co = $co(function* () {
        //mime文件类型
        var fext = /\.[^\.]+/.exec(filekey);
        fext = (fext && fext.length > 0) ? fext[0] : '';
        if (!extra) extra = new $qiniu.io.PutExtra();
        extra.mimeType = _mime[fext];

        //token获取
        var policy = new $qiniu.rs.PutPolicy(_qn.cfg.BucketName + ':' + filekey);
        var token = policy.token();
        var res = yield _ctnu($qiniu.io.put, token, filekey, dat, extra);
        return res;
    });
    return co;
};



/*http接口POST：删除一个文件
验证key是否和当前uid匹配
req:{key:'...'};
res:{}
*/
_rotr.apis.deleteFile = function () {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var fkey = ctx.request.body.key || ctx.query.key;
        if (fkey.indexOf(uid + '/') != 0) throw Error('You can delete only your own file.')

        var res = yield _qn.deleteFileCo(fkey);
        if (!res) throw Error('Delete file faild.');

        ctx.body = __newMsg(1, 'ok');

        ctx.xdat.deleteFile = res;
        return ctx;
    });
    return co;
};


/*单独函数deleteFileCo*/
_qn.deleteFileCo = deleteFileCo;

function deleteFileCo(fkey) {
    var co = $co(function* () {
        var uri = $qiniu.util.urlsafeBase64Encode(cfg.BucketName + ':' + fkey);
        var optpath = '/delete/' + uri;

        //根据uid授权路径的token
        var options = {
            hostname: 'rs.qiniu.com',
            port: 80,
            path: optpath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': '',
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);
        var res = yield _fns.httpReqPrms(options);

        return res;
    });
    return co;
};





//导出模块
module.exports = _qn;
