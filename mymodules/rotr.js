/*http路由分发
直接处理/app/:appname页面
分发处理/api/:apiname请求
*/

var _rotr = {};

//http请求的路由控制
_rotr = new $router();

//访问pie（app）的请求
_rotr.get('pie', '/pie/:appname', pageApp);
_rotr.get('pie', '/pie/:puid/:appname', pageApp);
_rotr.get('app', '/app/:appname', pageApp);
_rotr.get('app', '/app/:puid/:appname', pageApp);


var pieAppHtml = $fs.readFileSync('mymodules/src/pieApp.html', 'utf-8');

/*生成app页面;如果有uid那么使用，如果没有那么就设定为1*/
function* pageApp(next) {
    var puid = this.xdat.pieUid = this.params.puid;
    if (!puid) puid = 1;
    var pienm = this.xdat.pieName = puid + '/' + this.params.appname;

    //从_map:pie.name:pie.id取pieid
    var pieid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', pienm);
    var piekeynm = this.xdat.pieKey = 'pie-' + pieid;

    //将当前pie写入cookie，以备api检查权限
    this.cookies.set('pie', pienm);

    //检测是否存在账号ukey，并检查ukey是否合法匹配到uid，如果不合法则清除
    var ukey = this.cookies.get('ukey');
    var ukeyexist = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
    if (!ukeyexist) ukey = undefined;

    //如果没有则创建一个新用户，并将ukey写入客户端cookie
    if (!ukey) {
        var usr = yield _usr.createUsrCo();
        this.xdat.isNewUsr = true;
        this.cookies.set('ukey', usr.ukey);
        ukey = usr.ukey;
    };
    this.xdat.ukey = ukey;

    //从rds数据库获取app的数据（js文件地址）
    var pieUrl = yield _ctnu([_rds.cli, 'hget'], piekeynm, 'url');
    this.xdat.pieUrl = pieUrl;
    var pienmshort = pienm.replace(/^\d\//, '');

    //发送嵌有app.js路径的html模版;<body>部分应该被app替换;默认自带jquery
    var piehtml = pieAppHtml;
    piehtml = piehtml.replace(/{{pieNameShort}}/g, pienmshort);
    piehtml = piehtml.replace(/{{pieUrl}}/g, pieUrl);
    piehtml = piehtml.replace(/{{pieName}}/g, pienm);

    this.body = piehtml;
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
    var ctx = this;

    //api请求不生成ukey，但写入xdat
    ctx.xdat.ukey = ctx.cookies.get('ukey');

    //所有api请求必须有uid才能继续
    yield _usr.getUidByHttpCC.call(ctx);
    if (!ctx.xdat.uid) {
        ctx.body = __errMsgs.usrUnkown;
        yield next;
        return;
    };

    var apinm = ctx.params.apiname;
    var apifn = _rotr.apis[apinm];

    if (apifn && apifn.constructor == Function) {
        try {
            yield apifn.call(ctx, next).then(null, function (err) {
                //api异常捕获
                ctx.body = __newMsg(__errCode.APIERR, apinm + ' process failed:' + err.message);
            });
        } catch (err) {
            __errhdlr(err);
            ctx.body = __newMsg(__errCode.APIERR, 'Api process failed:' + apinm)
        };
    } else {
        ctx.body = __newMsg(__errCode.NOTFOUND, 'Api not found:' + apinm);
    };
    yield next;
};



//访问favicon的请求
var favicon = $fs.readFileSync('favicon.png');
_rotr.get('/favicon.ico', function* (next) {
    //读取图片文件返回
    this.body = favicon;
});


//访问首页welcome的请求，暂不缓存
_rotr.get('/web/welcome.js', piewelcome);
_rotr.get('/pie/web/welcome.js', piewelcome);

function* piewelcome(next) {
    var dat = $fs.readFileSync('./web/welcome.js');
    //读取图片文件返回
    this.body = dat;
}

//访问首页start的请求，暂不缓存
_rotr.get('/web/start.js', piestart);
_rotr.get('/pie/web/start.js', piestart);

function* piestart(next) {
    var dat = $fs.readFileSync('./web/start.js');
    //读取图片文件返回
    this.body = dat;
}



//访问首页editor的请求，暂不缓存
_rotr.get('/web/editor.js', pieeditor);
_rotr.get('/pie/web/editor.js', pieeditor);

function* pieeditor(next) {
    var dat = $fs.readFileSync('./web/editor.js');
    //读取图片文件返回
    this.body = dat;
}

//访问首页start的请求，暂不缓存
_rotr.get('/web/sample.js', piesample);
_rotr.get('/pie/web/sample.js', piesample);

function* piesample(next) {
    var dat = $fs.readFileSync('./web/sample.js');
    //读取图片文件返回
    this.body = dat;
}



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
