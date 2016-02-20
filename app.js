global.hub = {}; //串联器hub用于存储共享变量,以文件模块为组织
global.lib = {}; //外部库用于放置所有reqire模块
global.mlib = {}; //自定义库用于放置所有reqire模块

var app = hub.app = {};

//外部库引入
lib.http = require('http');
lib.koa = require('koa');
lib.sktio = require('socket.io');
lib.router = require('koa-router');

//自定义库引入
mlib.router=require('./mymodules/router.js');

var koaSvr = app.koaApp = lib.koa();
var httpSvr = app.httpApp = lib.http.createServer(koaSvr.callback());
var sktSvr = app.sktSvr = lib.sktio(httpSvr);


//正式服务器80监听，本地测试8000
httpSvr.listen(80);
httpSvr.on('error', function (err) {
    switch (err.code) {
    case 'EACCES':
        httpSvr.listen(8002);
        console.log('App started on localhost server.');
        break;
    default:
        console.log('App start failed:', err);
        break;
    };
});


//自动匹配http默认路径
koaSvr.use(function* (next) {
    if (this.path == '/' || this.path == '/index' || this.path == '/index.html') {
        this.path = '/pie/start';
        //临时返回
        this.body = welstr;
        return;
    };
    yield next;
});

//http请求的路由控制
koaSvr.use(mlib.router.routes());



//临时欢迎模版
var welstr = '<div style="text-align:center;margin-top:20%;font-size:1em">';
welstr += '<p style="margin:0;font-size:1.2em;">欢迎来到代码派！</p>';
welstr += '<p style="font-size:0.75em;margin:0">Welcome to jscodepie!</p>';
welstr += '<p style="margin:0;font-size:0.75em;">网站正在建设中，即将揭幕！</p>';
welstr += '<p style="font-size:0.75em;margin:0;">Website is under construction, opening soon！<p>';
welstr += '<div>';
