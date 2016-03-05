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
    //检测是否登陆账号，如果没有则创建一个新用户，并将ukey写入客户端cookie
    var ukey = this.cookies.get('ukey');
    if (!ukey) {
        var usr = yield _usr.newUsrCo();
        this.cookies.set('ukey', usr.ukey);
    };

    //发送嵌有app.js路径的html模版;<body>部分应该被app替换
    this.body = '<! DOCTYPE><html><head>';
    this.body += '<title>' + this.params.appname + '</title>';
    this.body += '</head><body>';
    this.body += '<div style="text-align:center"> App [ ' + this.params.appname + ' ] is loading...</div>';
    this.body += '</body></html>';
};




//访问api的get/post请求
_rotr.get('api', '/api/:apiname', procApi);
_rotr.post('api', '/api/:apiname', procApi);

/*处理Api请求*/
function* procApi(next) {
    this.body = JSON.stringify({
        code: 1,
        text: 'OK',
        data: {
            api: this.params.apiname,
        },
    });
};

//访问favicon的请求
var favicon = $fs.readFileSync('favicon.png');
_rotr.get('/favicon.ico', function* (next) {
    //读取图片文件返回
    this.body = favicon;
});

//导出模块
module.exports = _rotr;
