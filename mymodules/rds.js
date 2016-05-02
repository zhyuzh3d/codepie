/*连接redis服务器
提供redis相关的基础功能函数
_cls（zset）键存储所有类型对象的autoid，由创建对象的时候incryby自动补齐
_map:key1.attr:key2.attr(hash/zset)存储各类映射检索，如果后者key2.attr是id数字，那么使用zset,否则使用hash
*/

var _rds = {};
var cli = _rds.cli = $redis.createClient(6379, 'localhost', {});


/*导出全局_rdscfg对象
读取静态cfg(如果不存在就自动设置)
*/
$co(function* () {
    var mult = cli.multi();
    mult.hsetnx('_cfg', '_author', 'zhyuzh');
    mult.hgetall('_cfg');
    var res = yield _ctnu([mult, 'exec']);
    if (res[1]) {
        cfg = res[1];
    } else {
        throw Error('_rds:read _cfg failed.');
    };
    return cfg;
}).then(function (cfg) {
    global.__rdsCfg = cfg;
}, __errhdlr);




/*测试性能
setTimeout(function () {
    $co(function* () {
        var st = Number(new Date());
        console.log('start', st);

        var n = 0;
        for (var i = 0; i < 10000; i++) {
            var mu=_rds.cli.multi();
            mu.select(n);
            mu.hget('test','val');
            mu.hgetall('usr-1');
            yield _ctnu([mu, 'exec']);
            //yield _ctnu([_rds.cli, 'hget'], 'test', 'val');
        };
        var ed = Number(new Date());
        console.log('start', ed - st);
    }).then(null, __errhdlr);
}, 3000);
*/






//导出模块
module.exports = _rds;
