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

/*初始化设置,依赖xcfg*/
_cfg.xcfgCo().then(function (xcfg) {
    $qiniu.conf.ACCESS_KEY = xcfg.qiniu.ACCESS_KEY;
    $qiniu.conf.SECRET_KEY = xcfg.qiniu.SECRET_KEY;
    _app.httpSvr.listen(cfg.Port, function () {
        __infohdlr("qiniu:listening on port:" + cfg.Port);
    });
    return;
}).then(null, __errhdlr);


/*http接口：获取上传token的接口
存储锁定uid/...
每个用户单独的路径以用户id为编号，格式'../455/'
req:{fpath:'...'}
*/
_rotr.apis.getUploadToken = function getUploadTokenCo() {
    var ctx = this;

    var co = $co(function* () {
        var uid = ctx.xdat.uid;
        var fpath = ctx.query.fpath || ctx.request.body.fpath;
        if (!fpath || fpath == '') throw Error('File cannot be undefeind!');

        //根据uid授权路径的token
        var key = ctx.xdat.uid + '/' + fpath;
        var pubPutPolicy = new $qiniu.rs.PutPolicy(cfg.BucketName + ':' + key);
        pubPutPolicy.returnBody = '{"name": $(fname),"size": $(fsize),"type": $(mimeType),"color": $(exif.ColorSpace.val),"key":$(key),"w": $(imageInfo.width),"h": $(imageInfo.height),"hash": $(etag)}';
        var token = pubPutPolicy.token();
        var respdat = {
            uid: ctx.xdat.uid,
            key: key,
            domain: cfg.BucketDomain,
            uptoken: token,
        };
        ctx.body = __newMsg(1, 'OK', respdat);
        ctx.xdat.uploadToken = token;
        return ctx;
    });
    return co;
};


/*获取文件夹列表
锁定用户的uid/folder路径
marker标识分页位置，即上一次显示到第几个
req:{path:'myfolder/subfolder/',limit:100,marker:'eyJjIjowLCJrIjoiM...'};
res:{}
*/
_rotr.apis.getFileList = function getUploadTokenCo() {
    var ctx = this;

    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var optpath = '/list?bucket=jscodepie&prefix=' + uid + '/';

        //个人子文件夹，不要以/开头
        var path = ctx.query.path || ctx.request.body.path;
        if (path && path != '') optpath += path;

        var limit = ctx.query.limit || ctx.request.body.limit;
        if (!limit) limit = 100;
        optpath += '&limit=' + limit;

        var marker = ctx.query.marker || ctx.request.body.marker;
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
                'limit': limit,
                'marker': marker,
            },
        };

        //计算token
        options.headers.Authorization = $qiniu.util.generateAccessToken(options.path, null);

        var prms = _fns.httpReqPrms(options);

        var res = yield prms;
        var bdobj = JSON.safeParse(res.body);
        bdobj.domain = cfg.BucketDomain;
        ctx.body = bdobj;
        return ctx;

    });
    return co;
};






/*http接口POST：上传字符串或数据，存储到七牛，返回文件url
自动覆盖已有文件，存储目录锁定/uid/...
req:{data,file};如果没有data则为空字符串，如果没有file则随机一个md5文件名； 自动判断扩展名
res:{url:'bucketdomain/uid/file}
*/
_rotr.apis.uploadData = function uploadDataCo(next) {
    var ctx = this;
    var co = $co(function* () {
        var uid = ctx.xdat.uid;

        var extra = new $qiniu.io.PutExtra();
        var reqbd = ctx.request.body; //POST对象

        //mime文件类型
        var fext = /\.[^\.]+/.exec(reqbd.file);
        fext = (fext && fext.length > 0) ? fext[0] : '';
        extra.mimeType = _mime[fext];

        //token获取
        var filekey = uid + '/';
        if (reqbd.file && reqbd.file.toString() && reqbd != '') {
            filekey += reqbd.file;
        } else {
            filekey += __md5();
        };
        var policy = new $qiniu.rs.PutPolicy(cfg.BucketName + ':' + filekey);

        //存储到七牛
        if (!reqbd.data) reqbd.data = '';
        var res = yield _ctnu($qiniu.io.put, policy.token(), filekey, reqbd.data, extra);
        if (!res || !res.key) throw Error('Upload data failed,cannot get url');

        ctx.xdat.uploadData = res;
        ctx.body = __newMsg(1, 'ok', {
            url: cfg.BucketDomain + res.key,
        });
    });
    return co;
};









//导出模块
module.exports = _qn;
