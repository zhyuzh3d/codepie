var mod = {};

//http请求的路由控制
mod = new lib.router();

//访问pie（app）的请求
mod.get('pie', '/pie/:piename', function* (next) {
    this.body = 'GET:Current pie is [' + this.params.piename + '] !';
});

//访问api的请求
mod.get('api', '/api/:apiname', function* (next) {
    this.body = 'GET:Current api is [' + this.params.apiname + '] !';
});
mod.post('api', '/api/:apiname', function* (next) {
    this.body = 'POST:Current api is [' + this.params.apiname + '] !';
});

//访问favicon的请求
mod.get('/favicon.ico', function* (next) {
    //读取图片文件返回
    this.body = 'favicon...';
});


//导出模块
module.exports = mod;
