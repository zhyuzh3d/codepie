/*程序入口
初始化启动http和skt服务器
外部引入的模块使用$开头，如$http;
自定义的模块以下划线开头,尽可能简短，如_rds
自定义的全局变量以两个下划线开头，尽可能简短，如__rdsCfg
自定义模块输出无下划线同名对象，如export rds;
*/


var _app = global._app = {};

//外部库引入
var $http = global.$http = require('http');
var $fs = global.$fs = require('fs');
var $koa = global.$koa = require('koa');
var $bodyParser = global.$bodyParser = require('koa-bodyparser');
var $sktio = global.$sktio = require('socket.io');
var $router = global.$router = require('koa-router');
var $gzip = global.$gzip = require('koa-gzip');
var $filesvr = global.$filesvr = require('koa-file-server');
var $redis = global.$redis = require('redis');
var $co = global.$co = require('co');
var $uuid = global.$uuid = require('node-uuid');
var $qiniu = global.$qiniu = require('qiniu');
var $mailer = global.$mailer = require('nodemailer');
var $crypto = global.$crypto = require('crypto');
var $cookie = global.$cookie = require('cookie');

//自定义库引入
global._mime = require('./mymodules/mime.js');
global._ctnu = require('./mymodules/ctnu.js');
global._cfg = require('./mymodules/cfg.js');
global._fns = require('./mymodules/fns.js');
global._rds = require('./mymodules/rds.js');
global._rotr = require('./mymodules/rotr.js');
global._skt = require('./mymodules/skt.js');

global._usr = require('./mymodules/usr.js');
global._pie = require('./mymodules/pie.js');
global._mdwr = require('./mymodules/mdwr.js');
global._qn = require('./mymodules/qn.js');
global._init = require('./mymodules/init.js');


//服务器对象
var koaSvr = _app.koaSvr = $koa();
var httpSvr = _app.httpSvr = $http.createServer(koaSvr.callback());
var sktSvr = _app.sktSvr = $sktio(httpSvr);


//正式服务器80监听，本地测试8000
_app.hostName = 'www.jscodepie.com';
_app.hostPort = 80;
_app.hostUrl = 'http://www.jscodepie.com';
httpSvr.listen(_app.hostPort);

httpSvr.on('error', function (err) {
    switch (err.code) {
    case 'EACCES':
        _app.hostName = 'localhost';
        _app.hostPort = 8088;
        _app.hostUrl = 'http://localhost:' + _app.hostPort;
        //修改存储路径到filesdev
        _qn.cfg.BucketDomain = _qn.cfg.BucketDomainDev;
        httpSvr.listen(_app.hostPort);
        console.log('App started on localhost server.');
        break;
    default:
        console.log('App start failed:', err);
        break;
    };
});

var hasinit = false;
httpSvr.on('listening', function (err) {
    if (!hasinit) {
        _init.init();
        hasinit = true;
    };
});

//开启gzip
koaSvr.use($gzip());

//静态文件目录
koaSvr.use($filesvr({
    root: './myfiles/',
    //    maxage: 0,
    //    etag: 'algorithm'
}));

//使用body解析器
koaSvr.use($bodyParser({
    onerror: function (err, ctx) {
        ctx.request.body = undefined;
        __errhdlr(err);
    }
}));

//http请求中间件
koaSvr.use(_mdwr);

//http请求的路由控制
koaSvr.use(_rotr.routes());

/*http请求中间件示例
koaSvr.use(test);
function* test(next) {
    console.log('>After router', this.ginfo);
    this.ginfo.test='will be trans to next midware';
    yield next;
}
*/


//启动socketio处理流程
_app.sktSvr.on('connection', function (skt) {
    _skt.start(skt);
});







//end
