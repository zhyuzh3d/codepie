/*http路由分发
直接处理/app/:appname页面
分发处理/api/:apiname请求
*/

var _rotr = {};

//http请求的路由控制
_rotr = new $router();

//访问pie（app）的请求
_rotr.get('pie', '/pie/:appname', pageApp);
_rotr.get('app', '/app/:appname', pageApp);

/*生成app页面*/
function* pageApp(next) {
    var pienm = this.xdat.pieName = this.params.appname;
    var piekeynm = this.xdat.pieKey = 'pie-' + this.params.appname;

    //将当前pie写入cookie，以备api检查权限
    this.cookies.set('pie', pienm);

    //检测是否存在账号，如果没有则创建一个新用户，并将ukey写入客户端cookie
    var ukey = this.cookies.get('ukey');
    if (!ukey) {
        var usr = yield _usr.newUsrCo();
        this.xdat.isNewUsr = true;
        this.cookies.set('ukey', usr.ukey);
        ukey = usr.ukey;
    };
    this.xdat.ukey = ukey;

    //从rds数据库获取app的数据（js文件地址）
    var pieUrl = yield _ctnu([_rds.cli, 'hget'], piekeynm, 'url');
    this.xdat.pieUrl = pieUrl;

    //发送嵌有app.js路径的html模版;<body>部分应该被app替换;默认自带jquery
    this.body = '<! DOCTYPE HTML><html><head><title>' + pienm + '</title><script data-main="' + pieUrl + '" src="//cdn.bootcss.com/require.js/2.1.22/require.min.js"></script></head><body><div id="_pieLocator" pieUrl="' + pieUrl + '"><div id="_pieTemp" style="text-align:center;margin-top:15%;line-height:1.5em">Welcome to jscodepie.com!<br>App[' + pienm + '] is loading... <br> [' + pieUrl + '] </div></div></body></html>';
    yield next;
};


//访问api的get/post请求
_rotr.get('api', '/api/:apiname', procApi);
_rotr.post('api', '/api/:apiname', procApi);

/*所有api处理函数都收集到这里
必须是返回promise
各个api处理函数用promise衔接,return传递ctx
*/
_rotr.apis = {};

/*处理Api请求*/
function* procApi(next) {
    //api请求不生成ukey，但写入xdat
    this.xdat.ukey = this.cookies.get('ukey');

    //所有api请求必须有uid才能继续
    yield _usr.getUidByHttpCC.call(this);
    if (!this.xdat.uid) {
        this.body = __errMsgs.usrUnkown;
        yield next;
        return;
    };

    var apinm = this.params.apiname;
    var apifn = _rotr.apis[apinm];

    if (apifn && apifn.constructor == Function) {
        try {
            yield apifn.call(this, next).then(null, function (err) {
                //api异常捕获
                this.body = __newMsg(__errCode.APIERR, apinm + ' process failed:' + err.message);
            });
        } catch (err) {
            __errhdlr(err);
            this.body = __newMsg(__errCode.APIERR, 'Api process failed:' + apinm)
        };
    } else {
        this.body = __newMsg(__errCode.NOTFOUND, 'Api not found:' + apinm);
    };
    yield next;
};



//访问favicon的请求
var favicon = $fs.readFileSync('favicon.png');
_rotr.get('/favicon.ico', function* (next) {
    //读取图片文件返回
    this.body = favicon;
});

//访问首页start的请求，暂不缓存
_rotr.get('/web/start.js', function* (next) {
    var dat = $fs.readFileSync('./web/start.js');
    //读取图片文件返回
    this.body = dat;
});

//访问首页start的请求，暂不缓存
_rotr.get('/web/sample.js', function* (next) {
    var dat = $fs.readFileSync('./web/sample.js');
    //读取图片文件返回
    this.body = dat;
});

//访问首页piejs的请求，缓存
_rotr.get('/web/wpie.js', function* (next) {
    var dat = $fs.readFileSync('./web/wpie.js');
    //读取图片文件返回
    this.body = dat;
});

//访问首页qiniu的请求，缓存
var qndat = $fs.readFileSync('./web/qiniu.js');
_rotr.get('/web/qiniu.js', function* (next) {
    //读取图片文件返回
    this.body = qndat;
});



//导出模块
module.exports = _rotr;
