/*所有设置参数
必须在app文件夹外面有合法的xcfg.json用以保存私密参数
xcfg文件json的读写功能
*/

var mod = {};

mod.xcfg = function () {
    var xstr = lib.fs.readFileSync('../xcfg.json', 'utf-8');
    var xobj = JSON.sparse(xstr);
    return xobj;
}();


/*



lib.co(function* () {
    var res;// = yield
    //function (cb) {
        //        cli.hgetall('_cfg', cb);
    //};

    var fn = mlib.ctn.gen(mlib.rds.cli.hgetall, '_cfg');
    console.log('>>>>>>fn', fn);
    res = yield fn;


    console.log('>>rds cfg', res);
    return res;
}).then(function (v) {
    console.log('>>>v', v);
}, function (err) {
    console.log('>>>err', err.stack);
});
*/








//导出模块
module.exports = mod;
