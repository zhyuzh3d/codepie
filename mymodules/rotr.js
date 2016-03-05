/*http路由分发
直接处理/app/:appname页面
分发处理/api/:apiname请求
*/

var rotr = {};

//http请求的路由控制
rotr = new $router();

//访问pie（app）的请求
rotr.get('pie', '/pie/:appname', pageApp);
rotr.get('app', '/app/:appname', pageApp);

/*生成app页面*/
function* pageApp(next) {
    this.body = '<! DOCTYPE><html><head>';
    this.body += '<title>' + this.params.appname + '</title>';
    this.body += '</head><body>';
    this.body += 'GET:Current pie is <span style="color:#22bbff">[' + this.params.appname + ']</span> !';
    this.body += '</body></html>';
};


//访问api的get/post请求
rotr.get('api', '/api/:apiname', procApi);
rotr.post('api', '/api/:apiname', procApi);

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
rotr.get('/favicon.ico', function* (next) {
    //读取图片文件返回
    this.body = favicon;
});

//导出模块
module.exports = rotr;
