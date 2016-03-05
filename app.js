/*程序入口
初始化启动http和skt服务器
外部引入的模块使用$开头，如$http;
自定义的模块以下划线开头,尽可能简短，如_rds
自定义的全局变量以两个下划线开头，尽可能简短，如__rdsCfg
自定义模块输出无下划线同名对象，如export rds;
*/

global.hub = {}; //串联器hub用于存储共享变量,以文件模块为组织
global.lib = {}; //外部库用于放置所有reqire模块
global.mlib = {}; //自定义库用于放置所有reqire模块
global.cfg = {}; //自定义库读取自redis数据库


var app = hub.app = {};

//外部库引入
global.$http = require('http');
global.$fs = require('fs');
global.$koa = require('koa');
global.$sktio = require('socket.io');
global.$router = require('koa-router');
global.$redis = require('redis');
global.$co = require('co');
global.$uuid = require('node-uuid');


//自定义库引入
global._ctnu = require('./mymodules/ctnu.js');
global._fns = require('./mymodules/fns.js');
global._cfg = require('./mymodules/cfg.js');
global._rds = require('./mymodules/rds.js');
global._usr = require('./mymodules/usr.js');
global._rotr = require('./mymodules/rotr.js');
global._mdwr = require('./mymodules/mdwr.js');


//服务器对象
var koaSvr = app.koaApp = $koa();
var httpSvr = app.httpApp = $http.createServer(koaSvr.callback());
var sktSvr = app.sktSvr = $sktio(httpSvr);


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
koaSvr.use(_mdwr)

//http请求的路由控制
koaSvr.use(_rotr.routes());






//end
