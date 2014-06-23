//'use strict';


var http = require('http');
var qs = require("querystring");
var crypto = require('crypto');

//nightmare
params = {};

function SMS(api_id, login, passwd) {
        
    if(login && passwd){
        this.login = login;
        this.passwd = passwd;
        

        this.getToken(function(err,array){

            var token = array[0];
            var api_id = !api_id?'':api_id;
            var sha512  = crypto.createHash('sha512').update(passwd + token + api_id).digest("hex");   
            
            params = ({login: login, sha512: sha512, token: token});
           

        });

    }else{
        params = {api_id: api_id};
    }
    
}

//SMS.prototype.sendArray = function(phone, text, callback, from, time ,translit){
//    for(var i = 0, l = phone.length; i < l; i++){
//        this.send(phone[i], text, callback, from, time ,translit);
//    }
//}

SMS.prototype.saveParams = function(params){
    this.params = params;
}

SMS.HOST = 'sms.ru';
SMS.SEND = '/sms/send?';
SMS.STATUS = '/sms/status?';
SMS.COST = '/sms/cost?';
SMS.BALANCE = '/my/balance?';
SMS.LIMIT = '/my/limit?';
SMS.SENDERS = '/my/senders?';
SMS.GET_TOKEN = '/auth/get_token';
SMS.CHECK = '/auth/check?';
SMS.ADD ='/stoplist/add?';
SMS.DEL ='/stoplist/del?';
SMS.GET ='/stoplist/get?';
SMS.UCS = '/sms/ucs?';

var env = process.env.NODE_ENV || 'development';

SMS.prototype.curl = function(options, callback){
    http.get(options, function(res){
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            if(callback)
                callback(null, chunk.split('\n'));
        });

    }).on('error', function(err){
        if(callback)
        callback(err);
    });
}

SMS.prototype.dev = false;

SMS.prototype.send = function(phone, text, callback, from, time ,translit){
    var query = {to:phone, text: text};
    if(from) query.from = from;
    if(time) query.time = ((new Date().getTime() + isNumeric(time)?time:0) / 1000).toFixed();
    if(translit == 1 || translit == true) query.translit = 1;
    if(this.dev) query.test = 1;

    var options = {
        hostname: SMS.HOST,
        port: 80,
        path: SMS.SEND + qs.stringify(params) +'&' + qs.stringify(query)
    }
    
    console.log(options.path);
    this.curl(options, callback);
};

SMS.prototype.send

SMS.prototype.getToken = function(callback) {
    var options = {
        hostname: SMS.HOST,
        port: 80,
        path: SMS.GET_TOKEN
    }
    this.curl(options, callback);
};




SMS.prototype.status = function(sms_id, callback){
    var query = {id:sms_id};
    var options = {
        hostname: SMS.HOST,
        port: 80,
        path: SMS.STATUS + qs.stringify(params) + '&'+  qs.stringify(query)
    }
    console.log(options.path);
    this.curl(options, callback);
}

SMS.prototype.balance = function(){
}
SMS.prototype.limit = function(){};


module.exports = SMS;
