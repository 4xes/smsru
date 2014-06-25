'use strict';


var http = require('http');
var qs = require("querystring");
var crypto = require('crypto');


function formatParams(params) {
    var result = [];


    Object.keys(params).forEach(function (key) {
        result.push(key + '=' + params[key]);
    });

    return result.join('&');
}

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
    var url = 'http://sms.ru' + method + '?' + formatParams(merge(this.auth, params));
    console.log('URL : ' + url);
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
    })
}


SmsRu.prototype.cost = function (params, callback) {

    this.curl("/sms/cost", params, function (err, body) {
        var data = body.split('\n');
        console.log(data);
        if (err) {
            callback(err);
        } else if (!("100" === data[0])) {
            callback(new Error(data[0]));
        } else {
            callback(null, data[1], data[0]);

        }
    });
}

SmsRu.prototype.balance = function (callback) {

    this.curl("/my/balance", {}, function (err, body) {
        var data = body.split('\n');
        console.log(data);
        if (err) {
            callback(err);
        } else if (!("100" === data[0])) {
            callback(new Error(data[0]));
        } else {
            callback(null, data[1], data[0]);

        }
    });
}


SmsRu.prototype.check = function (callback) {
    this.curl("/auth/check", {}, function (err, result) {

        if (err) {
            callback(err);
        } else if (!(result === '100')) {
            callback(new Error(result));
        } else {
            callback(null, true);
        }
    });
};

///my/limit?

SmsRu.prototype.limit = function (callback) {

    this.curl("/my/limit", {}, function (err, body) {
        var data = body.split('\n');

        console.log(data);
        if (err) {
            callback(err);
        } else if (!("100" === data[0])) {
            callback(new Error(data[0]));
        } else {
            callback(null, data[0], data[1], data[2]);

        }
    });
}

SmsRu.prototype.senders = function (callback) {

    this.curl("/my/senders", {}, function (err, body) {
        var data = body.split('\n');
        console.log(data);
        if (err) {
            callback(err);
        } else if (!("100" === data[0])) {
            callback(new Error(data[0]));
        } else {
            callback(null, data.slice(1), data[0]);

        }
    });
}

SmsRu.prototype.send = function (params, callback) {
    
    if (params.time) params.time = ((new Date().getTime() + isNaN(params.time) ? params.time : 0) / 1000).toFixed();
    
    this.curl("/sms/send", params, function (err, body) {
        var data = body.split('\n');
        if (err) {
            callback(err);
        } else if (!("100" === data[0])) {
            callback(new Error(data[0]));
        } else {
            callback(null, data[1], data[0]);
            
        }
    });
}

SmsRu.prototype.status = function (id, callback) {
    this.curl("/sms/status", {
        id: id
    }, function (err, result) {
        
        console.log(result);
        if (err) {
            callback(err);
        } else if (result < '100' || result > '103') {
            callback(new Error(result));
        } else {
            callback(null, result);
        }
    });
};

//http://sms.ru/stoplist/add?api_id=3e44bb61-7790-5b64-6d80-c43f14b2f80d&stoplist_phone=79251112233&stoplist_text=ban

function SmsRu(opt) {
    var self = this;
    this.api_id = opt.api_id;
 
    if (opt.login && opt.password) {
        this.login = opt.login;
        this.password = opt.password;
        
        
        this.token(function (err, token) {
            if (!err) {
                self.auth = { login: self.login, token: token, sha512: crypto.createHash('sha512').update(self.password + token + (!self.api_id ? '' : self.api_id)).digest("hex") };
                console.log(self.auth);
            }
            
        });
        //we need to get token every 10 minutes
        if (opt.autoToken) {
            setInterval(function () {
                this.token(function (err, token) {
                    if (!err) {
                        self.auth = { login: self.login, token: token, sha512: crypto.createHash('sha512').update(self.password + token + (!self.api_id ? '' : self.api_id)).digest("hex") };
                        console.log(self.auth);
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
    this.curl('/auth/get_token', {}
    , function(err, token){
        if(err){
            callback(err);
        } else {
            callback(null, token);
        }
    });
};


module.exports = SmsRu;
