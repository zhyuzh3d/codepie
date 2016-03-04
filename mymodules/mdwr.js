/*处理http请求进入路由之前的流程
如调整路径，检测用户user认证等
*/

var mdwr = function* (next) {
    if (this.path == '/' || this.path == '/index' || this.path == '/index.html') {
        this.path = '/pie/start';
        //临时返回
        this.body = welstr;
        return;
    };
    yield next;
};



//临时欢迎模版
var welstr = '<div style="text-align:center;margin-top:20%;font-size:1em">';
welstr += '<p style="margin:0;font-size:1.2em;">欢迎来到代码派！</p>';
welstr += '<p style="font-size:0.75em;margin:0">Welcome to jscodepie!</p>';
welstr += '<p style="margin:0;font-size:0.75em;">网站正在建设中，即将揭幕！</p>';
welstr += '<p style="font-size:0.75em;margin:0;">Website is under construction, opening soon！<p>';
welstr += '<div>';


//导出模块
module.exports = mdwr;
