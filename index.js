'use strict';


var http = require('https');
var qs = require('querystring');
var crypto = require('crypto');

var merge = function () {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};

SmsRu.prototype.curl = function (method, params, callback) {
    var url = 'https://sms.ru' + method + '?' + qs.stringify(merge(this.auth, params));
    http.get(url, function(res){
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            callback(null, body);
        });
        res.on('error', function (err) {
            callback(err);
        });
    });
};


SmsRu.prototype.cost = function (params, callback) {

    this.curl("/sms/cost", params, function (err, body) {
        var data = body.split('\n');
        if (err)
            return callback(err);
        if (data[0] !=='100')
            return callback(new Error(data[0]));
        callback(null, parseFloat(data[1]), parseInt(data[2]));
    });
};

SmsRu.prototype.balance = function (callback) {

    this.curl("/my/balance", {}, function (err, body) {
        var data = body.split('\n');
        if (err)
            return callback(err);
        if (data[0] !=='100')
            return callback(new Error(data[0]));
        callback(null, parseFloat(data[1]));
    });
};


SmsRu.prototype.check = function (callback) {
    this.curl("/auth/check", {}, function (err, result) {
        if (err)
            return callback(err);
        if (result !== '100')
            return callback(new Error(result));
        callback(null);
    });
};

SmsRu.prototype.limit = function (callback) {

    this.curl("/my/limit", {}, function (err, body) {
        var data = body.split('\n');
        if (err)
            return callback(err);
        if (data[0] !=='100')
            return callback(new Error(data[0]));
        callback(null, parseInt(data[1]), parseInt(data[2]));
    });
};

SmsRu.prototype.senders = function (callback) {

    this.curl("/my/senders", {}, function (err, body) {
        var data = body.split('\n');
        if (err) {
            callback(err);
        }if (data[0] !=='100') {
            callback(new Error(data[0]));
        } else {
            callback(null, data.slice(1));

        }
    });
};

SmsRu.prototype.send = function (params, callback) {
    
    if (params.time) params.time = ((new Date().getTime() + isNaN(params.time) ? params.time : 0) / 1000).toFixed();
    
    this.curl("/sms/send", params, function (err, body) {
        var data = body.split('\n');
        if (err)
            return callback(err);
        if (data[0] !=='100')
            return callback(new Error(data[0]));
        callback(null, data[1]);
    });
};

SmsRu.prototype.status = function (id, callback) {
    this.curl("/sms/status", {
        id: id
    }, function (err, result) {
        if (err)
            return callback(err);
        result = parseInt(result);
        if (result < 100 || result > 103)
            return callback(new Error(result));
        callback(null, parseInt(result));
    });
};


SmsRu.prototype.stoplistAdd = function (params, callback) {
    
    
    this.curl("/stoplist/add", {
        stoplist_phone: params.phone,
        stoplist_text: params.reason?params.reason:''
    }, function (err, result) {
        if (err)
            return callback(err);
        if (result !=='100')
            return callback(new Error(result));
        callback(null);
    });
};


SmsRu.prototype.stoplistDel = function (params, callback) {
    var obj = {};
    if (typeof params === 'object' && params.phone) {
        obj.phone = params.phone;
    } else {
        obj.phone = params;
    }

    this.curl("/stoplist/del", {
        stoplist_phone: obj.phone
    }, function (err, result) {
        if (err)
            return callback(err);
        if (result !=='100')
            return callback(new Error(result));
        callback(null);
    });
};

var formatStopList = function (data, callback) {
    var obj = [];
    data.slice(1).forEach(function (elem) {
        var sp = elem.split(';');
        obj.push({ phone: sp[0], reason: sp[1] });

    });
    callback(null, obj, data[0]);
};

SmsRu.prototype.stoplist = function (callback) {

    this.curl("/stoplist/get", {}, function (err, body) {
        var data = body.split('\n');
        if (err)
            return callback(err);
        if (data[0] !=='100')
            return callback(new Error(data[0]));
        formatStopList(data, callback);
    });
};


function SmsRu(opt) {
    var self = this;
    this.api_id = opt.api_id;
 
    if (opt.login && opt.password) {
        this.login = opt.login;
        this.password = opt.password;

        this.token(function (err, token) {
            if (!err) {
                self.auth = { login: self.login, token: token, sha512: crypto.createHash('sha512').update(self.password + token + (!self.api_id ? '' : self.api_id)).digest("hex") };
            }            
        });
        
        
        //we need to get token every 10 minutes
        if (opt.autoToken === undefined || opt.autoToken === true) {
            setInterval(function () {
           
                self.token(function (err, token) {
                
                    if (!err) {
                        self.auth = { login: self.login, token: token, sha512: crypto.createHash('sha512').update(self.password + token + (!self.api_id ? '' : self.api_id)).digest("hex") };
                    }

                });
            }, 10 * 60 * 1000);
        }
    }
    else if (opt.api_id) {
        this.auth = { api_id: opt.api_id };
    }    
}


SmsRu.prototype.token = function(callback){
    this.curl('/auth/get_token', {}, 
    function(err, token){
        if(err)
            return callback(err);
        callback(null, token);
    });
};

module.exports = SmsRu;
