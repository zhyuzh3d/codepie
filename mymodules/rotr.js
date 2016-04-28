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
var notFoundHtml = $fs.readFileSync('mymodules/src/404.html', 'utf-8');

/*生成app页面;如果有/uid/参数那么使用，如果没有那么就设定为1*/
function* pageApp(next) {
    var puid = this.params.puid;
    if (!puid) puid = 1;
    var pienm = puid + '/' + this.params.appname;

    //从_map:pie.name:pie.id取pieid
    var pieid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', pienm);
    if (!pieid) {
        var html = notFoundHtml;
        this.body = notFoundHtml;
    } else {
        var piekeynm = this.xdat.pieKey = 'pie-' + pieid;

        //检测是否存在账号ukey，并检查ukey是否合法匹配到uid，如果不合法则清除
        var ukey = this.cookies.get('ukey');
        var uid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
        if (!uid) ukey = undefined;

        //如果没有则创建一个新用户，并将ukey写入客户端cookie
        if (!ukey) {
            var usr = yield _usr.createUsrCo();
            this.xdat.isNewUsr = true;
            ukey = usr.ukey;
            uid = usr.id;
        };

        //从rds数据库获取app的数据（js文件地址）
        var pieUrl = yield _ctnu([_rds.cli, 'hget'], piekeynm, 'url');
        var pienmshort = pienm.replace(/^\d\//, '');

        //将当前数据写入xdat，以备后续使用
        this.xdat.ukey = ukey;
        this.xdat.uid = uid;
        this.xdat.pid = pieid;
        this.xdat.puid = puid;
        this.xdat.pname = pienm;
        this.xdat.purl = pieUrl;


        //将当前pie写入cookie，以备api检查权限
        this.cookies.set('uid', uid);
        this.cookies.set('ukey', ukey);
        this.cookies.set('pid', pieid);
        this.cookies.set('puid', puid);
        this.cookies.set('pname', pienm);
        this.cookies.set('purl', pieUrl);

        //发送嵌有app.js路径的html模版;<body>部分应该被app替换;默认自带jquery;ts强制qiniu刷新
        var piehtml = pieAppHtml;
        piehtml = piehtml.replace(/{{pieNameShort}}/g, pienmshort);
        piehtml = piehtml.replace(/{{pieUrl}}/g, pieUrl + '?ts=' + Number(new Date()));
        piehtml = piehtml.replace(/{{pieName}}/g, pienm);

        this.body = piehtml;
    }
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




//手工控制mypies文件夹路由，暂不缓存
_rotr.get('api', '/mypies/:piename', procMypies);
var notfoundhtml = $fs.readFileSync('mymodules/src/404.html', 'utf-8');
var mypiefilearr = ['welcome', 'start', 'editor', 'sample', 'qiniu', 'wpie'];

/*处理文件请求*/
function* procMypies(next) {
    var ctx = this;
    var piename = ctx.params.piename;
    var piefile = './mypies/' + piename;

    if (mypiefilearr.indexOf(piename.replace(/\.js$/, '')) == -1) {
        ctx.body = notfoundhtml;
        yield next;
    };
    try {
        var dat = yield _ctnu($fs.readFile, piefile);
        ctx.body = dat;
    } catch (err) {
        ctx.body = notfoundhtml;
    };
};

/*获取基本页面信息的接口，这些信息实际都存在cookie里面（不返回ukey);
同时作为范例
{}
{uid:1,pid:12,puid:11,pname:'..',purl:'...'}
*/
_rotr.apis.getPageInfo = function (data) {
    var ctx = this;
    var co = $co(function* () {
        var dt = {
            uid: ctx.cookies.get('uid'),
            pid: ctx.cookies.get('pid'),
            puid: ctx.cookies.get('puid'),
            pname: ctx.cookies.get('pname'),
            purl: ctx.cookies.get('purl'),
        };
        ctx.body = __newMsg(1, 'OK', dt);
        return ctx;
    });
    return co;
};


//导出模块
module.exports = _rotr;
