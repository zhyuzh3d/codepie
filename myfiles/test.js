/*This line is created by jscodepie.com.
Tue May 31 2016 18:46:34 GMT+0800 (CST)
*//*外部库设置*/
require.config({
    paths: {
        jquery: 'http://' + window.location.host + '/lib/jquery/2.2.1/jquery.min',
        bootstrap: 'http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min',
        soketio: '//' + window.location.host + '/lib/socket.io/1.4.5/socket.io.min',
        piejs: 'http://' + window.location.host + '/lib/piejs/0.1.1/piejs',
        swal: 'http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min',
        toastr: 'http://' + window.location.host + '/lib/toastr.js/latest/toastr.min',
    },
    map: {
        '*': {
            'css': 'http://' + window.location.host + '/lib/require-css/0.1.8/css.min.js',
        }
    },
    shim: {
        bootstrap: {
            deps: ['css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap.min.css',
                   'css!http://' + window.location.host + '/lib/bootstrap/3.3.6/bootstrap-theme.min.css']
        },
        swal: {
            deps: ['css!http://' + window.location.host + '/lib/sweetalert/1.1.3/sweetalert.min.css']
        },
        toastr: {
            deps: ['css!http://' + window.location.host + '/lib/toastr.js/latest/toastr.min.css']
        },
    },
});


/*实际函数运行*/
define(['jquery', 'bootstrap', 'soketio', 'piejs', 'swal', 'toastr'],
       function ($, bootstrap, soketio, piejs, swal, toastr) {
        //新手从这里开始，请勿删除此行
console.log('>zui is loading...');
 var zui={};
/*所有在生成ui中遇到异常情况下返回这个错误err
*/
zui.errDom=function (msg){
  return $('<div id="zuiErrDom" style="color:red">'+msg+'</div>');
};

/*参数是一个obj或者多个参数(tag,id,class,style,html),或者一个字符串
{tag:'div',html:'button',class:'btn',style:{height:'100px'},id:'mybtn'}
'div','button','btn',{height:'100px}/'height:100px','mybtn'
'<div>button</div>'
范例1:zui.create(['div',btn btn-default','btn1']).appendTo(pieBox);
范例2:zui.create(['panel panel-default',[['div','btn btn-default','btn1',{width:'100px'}],
                                  ['div','btn btn-default','btn2',{width:'150px'}]],
            {width:'400px',height:'200px'}]).appendTo(pieBox);
范例3:zui.create({
  tag:'div',
  id:'mybtn',
  class:'panel panel-default',
  style:{height:'200px',width:'400px',background:'#1c758d'},
  html:['div','btn btn-primary','按钮',{width:'120px'}],
}).appendTo(pieBox);
*/
zui.create=function(){
  if(arguments[0]){
    var one=arguments[0];
    switch(one.constructor){
      case String://单个字符串'<div></div>'
        return $(one);
      case Array://数组［str－obj］或[[str-obj],{obj}];不支持[htmlstr,htmlstr]
        if(one.length<1) return zui.errDom('数组参数不能为空');
        var sub=one[0];
        switch(sub.constructor){
          case String://字符串描述的对象str-obj['div','btn','mybtn',{css},'div','mybtn']
            var obj={};
            obj.tag= (one.length>0)? one[0]:'div';
            if(one.length>1) obj.class=one[1];
            if(one.length>2) obj.html=one[2];
            if(one.length>3) obj.style=one[3];
            if(one.length>4) obj.id=one[4];
            return zui.create(obj);
          case Array||Object://多个数组描述的对象或对象[[str-obj],{obj}]
            var res=$('<div></div>');
            for(var n=0;n<one.length;n++){
              zui.create(one[n]).appendTo(res);
            };
            return res;
          default:
            return zui.errDom('不支持的参数格式:'+JSON.stringify(one));
        };
      case Object://标准的对象格式
        if(!one.tag) one.tag='div';
        var res=$('<'+one.tag+'></'+one.tag+'>');
        for (var attr in one){
          var str=one[attr];
          switch(attr){
            case 'html':
              //处理html属性的对象
              if(str.constructor==String){
                res.html(str);
              }else{
                res.append(zui.create(str));
              };
              break;
            case 'style'://只兼容对象格式{height:'200px'}，不兼容字符串格式，因为字符串还不如对象简单。
              str=JSON.parse(JSON.stringify(str));
              res.css(str);
              break;
            default:
              if(str.constructor!=String){
                try{
                  str=JSON.stringify(str);
                }catch(err){};
              };
              res.attr(attr,str);
              break;
          };
        };
        return res;
      default://其他格式返回为定义
        return zui.errDom('不支持的参数格式');
    };
  }else{
    //没有参数
    return zui.errDom('参数不能为空');
  };


};








//新手到这里结束，请勿删除此行
  return zui;
});





//end
