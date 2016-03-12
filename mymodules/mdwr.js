/*处理http请求进入路由之前的流程
如调整路径，检测用户user认证等
*/

var _mdwr = function* (next) {
    //调整默认路径
    if (this.path == '/' || this.path == '/index' || this.path == '/index.html') {
        this.path = '/pie/start';
    };
    __infohdlr(this.method + ':' + this.path);

    //添加用以传递数据的对象
    this.xdat = {};
    yield next;
};




//导出模块
module.exports = _mdwr;
