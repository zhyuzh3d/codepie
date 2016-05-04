/*自动初始化最基础的pieApp
包括welcome,start,sample
*/
var _init = {};

_init.init = function () {

    $co(function* () {
        //创建usr-1
        var usr1 = yield _ctnu([_rds.cli, 'EXISTS'], 'usr-1');
        if (!usr1) {
            usr1 = yield _usr.createUsrCo(1);

            //增加usr自增id到1000
            yield _ctnu([_rds.cli, 'zadd'], '_cls', 1000, 'usr')

            //绑定到邮箱admin@jscodepie（无需验证）
            var xcfg = yield _cfg.xcfgCo();
            var rstpw = Math.random().toString(36).substr(2).substr(0, 8);
            var mail = xcfg.adminMail;

            var mu = _rds.cli.multi();
            mu.hset('usr-1', 'mail', mail);
            mu.hset('usr-1', 'pw', __uuid());
            mu.zadd('_map:usr.mail:usr.id', 1, mail);
            var bindres = yield _ctnu([mu, 'exec']);

            //发送修改密码邮件到admin邮箱
            var epw = __md5(rstpw + mail);
            var tmpkey = '_tmp:resetPw:' + mail;
            var mu = _rds.cli.multi();
            mu.set(tmpkey, epw);
            mu.expire(tmpkey, 24 * 3600);
            mu.hset('usr-1', 'resetPwKey', tmpkey);
            var rstres = yield _ctnu([mu, 'exec']);

            //发送邮件
            var mailResetPwHtml = $fs.readFileSync('mymodules/src/resetPwMail.html', 'utf-8');
            var cont = mailResetPwHtml.replace('{{resetPw}}', rstpw);
            var rstmailres = yield _fns.sendMail(mail, 'The reset password from jscodepie.com', cont);
        };


        //需要自动创建的pie列表
        var piearr = [{
            name: 'welcome',
            url: '../mypies/welcome.js'
        }, {
            name: 'start',
            url: '../mypies/start.js'
        }, {
            name: 'editor',
            url: '../mypies/editor.js'
        }, {
            name: 'sample',
            url: '../mypies/sample.js'
        }];

        //为usr－1创建pie
        for (var i in piearr) {
            var p = piearr[i];
            var rp = yield _ctnu([_rds.cli, 'zscore'], '_map:pie.path:pie.id', '1/' + p.name);
            if (rp == null) {
                var pie = yield _pie.createPieCo(1, p.name);
                var res = yield _ctnu([_rds.cli, 'hset'], 'pie-' + pie.id, 'url', p.url);
            };
        };
    });
}


//导出模块
module.exports = _init;
