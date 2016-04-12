/*_usr.newPieCo = newPieCo;
创建一个pie键hash,名称pie-appname;
自动增加_cls（zset）键的pie分数，如果没有自动补充
返回co可链式.then(okfn,errfn)
okfn(pieinfo);
如果中途异常或已经存在，返回包含err的空对象
power:tmpusr

function newPieCo(piename, usrid) {
    var co = $co(function* () {
        var keynm = 'usr-' + piename;
        var mu = _rds.cli.multi();
        mu.hset(keynm, 'id', usr.id);
        mu.hset(keynm, 'nick', usr.nick);
        mu.hset(keynm, 'sex', usr.sex);
        mu.zadd('_map:usr.ukey:usr.id', usr.id, usr.ukey); //ukey到id的映射
        yield _ctnu([mu, 'exec']);
        return usr;
    }).then(null, function (err) {
        __errhdlr(err);
        return {
            _err: err
        };
    })
    return co;
};

*/









<!--    <script src='../lib/codemirror/lib/codemirror.js'></script>-->
<!--    <script src='../lib/codemirror/addon/hint/show-hint.js'></script>-->
<!--    <script src='../lib/codemirror/addon/hint/javascript-hint.js'></script>-->
<!--    <script src='../lib/codemirror/mode/javascript/javascript.js'></script>-->
<!--    <link rel='stylesheet' href='../lib/codemirror/addon/hint/show-hint.css'>-->



