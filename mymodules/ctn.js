/*专为co内yield调用异步函数而准备的封装函数
ctn返回continuable的可继续执行的异步函数
有两个版本，但只导出第一个
 */
var mod = {};

/*生成可以作为co中yield函数的continuable函数，Promise版本
可以接受1～4个参数
如果第一个参数如果是数字，当作sleep的毫秒数，后面参数忽略；
如果第一个参数是函数，后面的参数作为它的参数，并最后自动追加一个fn(err,dat)格式回调函数
*/
mod.ctn = function () {
    var args = arguments;
    var res;
    var arg0 = args.length > 0 ? args[0] : undefined;

    //直接返回sleep计时器
    if (typeof (arg0) == 'function') {
        res = genNomalRes(args);
    } else if (arguments[0] instanceof Array) {
        res = genRedisRes(args);
    } else {
        res = genSleepRes(args);
    };

    return res;
};

/*ctn中使用的sleep函数
当没有参数或第一个参数是数字的时候（后面参数将会被忽略）*/
function genSleepRes(args) {
    var res;
    var msec = args.length > 0 ? Number(args[0]) : 0;
    res = new Promise(function (resolvefn, rejectfn) {
        setTimeout(resrej(resolvefn, rejectfn), msec);
    });
    return res;
};


/*ctn中使用的常规处理函数
当第一个参数是普通函数的时候使用这个*/
function genNomalRes(args) {
    var res;
    var fn = args[0];
    //根据参数个数匹配调用方法;最多两个参数
    switch (args.length) {
    case 1:
        res = new Promise(function (resolvefn, rejectfn) {
            fn(resrej(resolvefn, rejectfn));
        });
        break;
    case 2:
        var p1 = args[1];
        res = new Promise(function (resolvefn, rejectfn) {
            fn(p1, resrej(resolvefn, rejectfn));
        });
        break;
    case 3:
        var p1 = args[1]
        var p2 = args[2];
        res = new Promise(function (resolvefn, rejectfn) {
            fn(p1, p2, resrej(resolvefn, rejectfn));
        });
        break;
    default:
        res = new Promise(function (resolvefn, rejectfn) {
            fn(resrej(resolvefn, rejectfn));
        });
        break;
    };
    return res;
};

/*ctn中使用的redis处理函数
当第一个参数是队列的时候使用这个, 队列必须是[对象，属性名字符串]
这个函数保留lib.rds.cli['command'](p1,callback)格式，可以避免redis中的this找不到问题
*/
function genRedisRes(args) {
    var res;
    var arg0 = args[0];
    //根据参数个数匹配调用方法;最多两个参数
    switch (args.length) {
    case 1:
        res = new Promise(function (resolvefn, rejectfn) {
            arg0[0][arg0[1]](resrej(resolvefn, rejectfn));
        });
        break;
    case 2:
        var p1 = args[1];
        res = new Promise(function (resolvefn, rejectfn) {
            arg0[0][arg0[1]](p1, resrej(resolvefn, rejectfn));
        });
        break;
    case 3:
        var p1 = args[1]
        var p2 = args[2];
        res = new Promise(function (resolvefn, rejectfn) {
            arg0[0][arg0[1]](p1, p2, resrej(resolvefn, rejectfn));
        });
        break;
    default:
        res = new Promise(function (resolvefn, rejectfn) {
            arg0[0][arg0[1]](resrej(resolvefn, rejectfn));
        });
        break;
    };
    return res;
};

/*ctn中使用的then回调函数*/
function resrej(resolvefn, rejectfn) {
    return function (err, dat) {
        if (!err) {
            resolvefn(dat);
        } else {
            rejectfn(err);
        };
    };
};







/*
        res = function (cb) {
            var s = mlib.rds.cli;
            //            mlib.rds.cli.hgetall('_cfg', function(err,dat){

            //对于redis需要保存最后一个命令！hgetall，所以要单独设定ctnx，或者想办法特别处理！！！！！！！
            s['hgetall']('_cfg', function (err, dat) {
                cb(err, dat);
            });
        }*/







/*生成可以作为co中yield函数的continuable函数，Callback版本
可以接受1～4个参数
如果第一个参数如果是数字，当作sleep的毫秒数，后面参数忽略；
如果第一个参数是函数，后面的参数作为它的参数，并最后自动追加一个fn(err,dat)格式回调函数
*/
mod.ctn2 = function () {
    var args = arguments;
    var fn = args.length > 0 ? args[0] : undefined;

    //如果参数为空，返回一个空的计时器回调
    if (!fn || typeof (fn) != 'function') {
        var msec = 0;
        if (fn.constructor == 'Number') msec = fn;
        return (function (cb) {
            setTimeout(cb, msec);
        });
    }

    var res;
    //根据参数个数匹配调用方法;最多两个参数
    switch (args.length) {
    case 1:
        res = function (cb) {
            fn(cb);
        };
        break;
    case 2:
        var p1 = args[1];
        res = function (cb) {
            fn(p1, cb);
        };
        break;
    case 3:
        var p1 = args[1]
        var p2 = args[2];
        res = function (cb) {
            fn(p1, p2, cb);
        };
        break;
    default:
        res = function (cb) {
            fn(cb);
        };
        break;
    };

    return res;
};



//导出模块
module.exports = mod.ctn;
