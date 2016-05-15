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
    var pname = puid + '/' + this.params.appname;

    //从_map:pie.path:pie.id取pid
    var pid = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', pname);
    if (!pid) {
        var html = notFoundHtml;
        this.body = notFoundHtml;
    } else {
        var piekeynm = this.ginfo.pieKey = 'pie-' + pid;

        //检测是否存在账号ukey，并检查ukey是否合法匹配到uid，如果不合法则清除
        var ukey = this.cookies.get('ukey');
        var uid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
        if (!uid) ukey = undefined;

        //如果没有则创建一个新用户，并将ukey写入客户端cookie
        if (!ukey) {
            var usr = yield _usr.createUsrCo();
            this.ginfo.isNewUsr = true;
            ukey = usr.ukey;
            uid = usr.id;
        };

        //从rds数据库获取app的数据（js文件地址）
        var purl = yield _ctnu([_rds.cli, 'hget'], piekeynm, 'url');
        var pnameshort = pname.replace(/^\d\//, '');

        //每个页面唯一标识pageid,用于skt服务识别
        var gkey = __uuid();

        //用户可能打开多个pie，所以pie相关的信息写入cookie是无效的
        this.cookies.set('ukey', ukey);

        //对应gid写入ginfo,以备后续函数读取
        var ginfo = this.ginfo = {
            uid: uid,
            ukey: ukey,
            pid: pid,
            puid: puid,
            pname: pname,
            purl: purl,
            gkey: gkey,
        };

        //ginfo写入rds缓存ginfo-gid，有gkey就能获取每个页面对应的信息如skt
        //以备读取和验证gkey和ukey匹配表示最终合法
        var mu = _rds.cli.multi();
        var ginfokey = 'ginfo-' + gkey;
        for (var attr in ginfo) {
            mu.hset(ginfokey, attr, ginfo[attr]);
            mu.expire(ginfokey, 3600 * 24);
        };
        mu.exec();

        //发送嵌有app.js路径的html模版;<body>部分应该被app替换;默认自带jquery;pgkey强制qiniu刷新
        var piehtml = pieAppHtml;
        piehtml = piehtml.replace(/{{pieNameShort}}/g, pnameshort);
        piehtml = piehtml.replace(/{{gkey}}/g, gkey); //gkey写入
        piehtml = piehtml.replace(/{{pieUrl}}/g, purl + '?gkey=' + gkey);
        piehtml = piehtml.replace(/{{pieUrlShort}}/g, purl);
        piehtml = piehtml.replace(/{{pieName}}/g, pname);

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

    //api请求不生成ukey
    var ukey = ctx.cookies.get('ukey');

    //获取uid
    var uid = yield _ctnu([_rds.cli, 'zscore'], '_map:usr.ukey:usr.id', ukey);
    if (!uid) {
        ctx.body = __errMsgs.usrUnkown;
        yield next;
        return;
    };

    //从req信息获取pname，如果puid为空，那么补1
    var pinfo = _pie.getPinfoByUrl(ctx.req.headers.referer);
    var pname = pinfo.pname;
    var puid = pinfo.puid;
    if (!uid) {
        ctx.body = __errMsgs.pieUnkown;
        yield next;
        return;
    };

    var apinm = ctx.params.apiname;

    //放入ginfo传递
    ctx.ginfo = {
        uid: uid,
        ukey: ukey,
        api: apinm,
        pname: pname,
        puid: puid,
    };

    //匹配到路由函数,路由函数异常自动返回错误；自动记录apiRes和apiName
    var apifn = _rotr.apis[apinm];
    ctx.apiName = apinm;

    if (apifn && apifn.constructor == Function) {
        yield apifn.call(ctx, next).then(null, function (err) {
            ctx.body = __newMsg(__errCode.APIERR, [err.message, 'API proc failed:' + apinm + '.']);
            __errhdlr(err);
        });
    } else {
        ctx.body = __newMsg(__errCode.NOTFOUND, ['服务端找不到接口程序', 'API miss:' + apinm + '.']);
    };
    yield next;
};


//手工控制mypies文件夹的文件路由，暂不缓存
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





//导出模块
module.exports = _rotr;
