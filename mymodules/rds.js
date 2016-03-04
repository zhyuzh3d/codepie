/*连接redis服务器
提供redis相关的基础功能函数
*/

var rds = {};
var cli = rds.cli = $redis.createClient(6379, 'localhost', {});


//读取静态cfg(如果不存在就自动设置)
$co(function* () {
    var mult = cli.multi();
    mult.hsetnx('_cfg', '_author', 'zhyuzh');
    mult.hgetall('_cfg');
    var res = yield _ctnu([mult, 'exec']);
    if (res[1]) {
        cfg = res[1];
    } else {
        throw Error('rds:read _cfg failed.');
    };
    return res;
}).then(_infohdlr, _errhdlr);

console.log('---')







//导出模块
module.exports = rds;
