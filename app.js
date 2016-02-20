/*程序入口
初始化启动http和skt服务器
初始化全局变量hub，lib，mlib
*/

global.hub = {}; //串联器hub用于存储共享变量,以文件模块为组织
global.lib = {}; //外部库用于放置所有reqire模块
global.mlib = {}; //自定义库用于放置所有reqire模块

var app = hub.app = {};

//外部库引入
lib.http = require('http');
lib.fs = require('fs');
lib.koa = require('koa');
lib.sktio = require('socket.io');
lib.router = require('koa-router');


//自定义库引入
mlib.router = require('./mymodules/router.js');
mlib.redis = require('./mymodules/redis.js');
mlib.midware = require('./mymodules/midware.js');


var koaSvr = app.koaApp = lib.koa();
var httpSvr = app.httpApp = lib.http.createServer(koaSvr.callback());
var sktSvr = app.sktSvr = lib.sktio(httpSvr);


//正式服务器80监听，本地测试8000
httpSvr.listen(80);
httpSvr.on('error', function (err) {
    switch (err.code) {
    case 'EACCES':
        httpSvr.listen(8000);
        console.log('App started on localhost server.');
        break;
    default:
        console.log('App start failed:', err);
        break;
    };
});


//http请求中间件
koaSvr.use(mlib.midware)

//http请求的路由控制
koaSvr.use(mlib.router.routes());






//end

