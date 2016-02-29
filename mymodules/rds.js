/*连接redis服务器
提供redis相关的基础功能函数
*/

var mod = {};
var cli = mod.cli = lib.redis.createClient(6379, 'localhost', {});


lib.co(function* () {
    var res = yield mlib.ctn([mod.cli, 'hgetall'], '_cfg');;
    return res;
}).then(function (dat) {
    console.log('>>fini ok', dat);
}, function (err) {
    console.log('>>fini err', err.stack);
})







//导出模块
module.exports = mod;
