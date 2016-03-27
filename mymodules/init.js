/*自动初始化最基础的pieApp
包括welcome,start,sample
*/
var _init = {};

$co(function* () {
    //创建usr-1
    var usr1 = yield _ctnu([_rds.cli, 'EXISTS'], 'usr-1');
    if (!usr1) usr1 = yield _usr.createUsrCo(1);

    //需要自动创建的pie列表
    var piearr = [{
        name: 'welcome',
        url: '../web/welcome.js'
    }, {
        name: 'start',
        url: '../web/start.js'
    }, {
        name: 'editor',
        url: '../web/editor.js'
    }, {
        name: 'sample',
        url: '../web/sample.js'
    }];

    //为usr－1创建pie
    for (var i in piearr) {
        var p = piearr[i];
        var rp = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.name:pie.id', '1/' + p.name);
        if (rp == null) {
            var pie = yield _pie.createPieCo(1, p.name);
            var res = yield _ctnu([_rds.cli, 'hset'], 'pie-' + pie.id, 'url', p.url);
        };
    };
})


//导出模块
module.exports = _init;
