var assert = require('assert');

//mocha -r should -R spec
var api_id = '{api_id}';
var login = '{login}';
var password = '{password}';

var sms = new (require('../index.js'))(
{
    api_id: api_id
});



describe('init', function(){   
    it('should be have #auth', function(){
        sms.should.have.property('auth').should.be.a.Object;
        sms.auth.should.have.property.api_id;
        
    });
});

describe('sms.send', function(){
    it('id should be format a ###.####', function(done){
        sms.send({
            to: '+79264488600',
            text: 'Hello Kitty!',
            test: true
        },
        function(err, id){
            if(err)
                return done(err);
            id.should.match(/^\d{3,6}-\d{3,6}$/);
            done();
        });
    
    })
});

if(false) //without status
describe('sms.status', function(done){
    it('result should be between 100 and 103', function(done){
        sms.send({
            to: '+79854488600',
            text: 'Hello Kitty!'
        },
        function(err, id, code){
            if(err)
                return done(err);
            sms.status(id, function(err, result){
                if(err)
                    return done(err);
                //100	Сообщение находится в нашей очереди
                //101	Сообщение передается оператору
                //102	Сообщение отправлено (в пути)
                //103	Сообщение доставлено
                result.should.be.within(100,103);
                done();
            });
        });
    
    })
});

describe('sms.cost', function(done){
    it('quantity sms should equal 1 and price be a number', function(done){
        sms.cost({
            to: '+79854488622',
            text: 'Hello Kitty!'
        },
        function(err, price, length){
            if(err)
                return done(err);
            price.should.be.a.Number;
            length.should.equal(1);
            done();
        });
    });
});


describe('sms.senders', function(done){
    it('senders should equal [\'#######\', .. ,\'\'] and should be an Array', function(done){
        sms.senders(
        function(err, senders){
            if(err)
                return done(err);
                senders.should.be.an.Array;
                senders.slice(0, senders.length-1).should.match(/(^\d{11}$)/);

            done();
        });
    });
});

describe('sms.balance', function(done){
    it('balance should be a number', function(done){
        sms.balance(
        function(err, balance){
            if(err)
                return done(err);
            balance.should.be.a.Number;
            done();
        });
    });
});

describe('sms.check , check authorization with  api_id', function(done){
    it('result should done', function(done){
        sms.check(
        function(err){
            if(err)
                return done(err);
            done();
        });
    });
});

describe('sms.limit', function(done){
    it('spentDay and availableDay should be a number and spentDay between 0 and availableDay ', function(done){
        sms.limit(
        function(err, availableDay, spentDay){
            if(err)
                return done(err);
            //количество номеров, на которое вы можете отправлять сообщения внутри дня
            availableDay.should.be.a.Number;
            //количество номеров, на которые вы уже отправили сообщения внутри текущего дня
            spentDay.should.be.a.Number;
            spentDay.should.be.within(0,availableDay);
            done();
        });
    });
});

describe('sms.token', function(done){
    it('token should have length 32', function(done){
        sms.token(
        function(err, token){
            if(err)
                return done(err);
            //32х значный ключ, закрепленный за вашим ip адресом на 10 минут
            token.should.have.length(32);
            done();
        });
    });
});


describe('sms.stoplistAdd', function(done){
    it('add in stipList 79218854433 with text, it should done', function(done){
        sms.stoplistAdd(
        {
            phone: '79218854433',
            reason: 'banned for test'
        }, function (err) {
            if (err)
                return done(err);
            done();
        });
    
    });

    it('add in stipList 79267622297 with text, it should done', function(done){
        sms.stoplistAdd(
        {
            phone: '79267622297',
            reason: 'banned for test'
        }, function (err) {
            if (err)
                return done(err);
            done();
        });   
    });
    it('add in stipList 79224443322 without text, it should done', function(done){
        sms.stoplistAdd(
        {
            phone: '79224443322'
        }, function (err) {
            if (err)
                return done(err);
            done();
        });   
    });
});

describe('sms.stoplist contain', function(done){
    it('stoplist should be an array and lengt above 2 and contain phones which we added before', function(done){
        sms.stoplist(function (err, stoplist) {
            if (err)
                return done(err);
            stoplist.should.be.an.Array;
            stoplist.length.should.above(2);
            stoplist.should.containEql({
                phone: '79218854433',
                reason: 'banned for test'
            });
            stoplist.should.containEql({
                phone: '79267622297',
                reason: 'banned for test'
            });
            stoplist.should.containEql({
                phone: '79224443322',
                reason: ''
            });
            
            done();
        });
    
    });

});

describe('sms.stoplistDel', function(done){
    it('del 79218854433 in stoplist, it should done', function(done){
        sms.stoplistDel(
        {
            phone: '79218854433',
        }, function (err) {
            if (err)
                return done(err);
            done();
        });
    
    });

    it('del 79267622297 in stoplist, it should done', function(done){
        sms.stoplistDel(
        {
            phone: '79267622297',
        }, function (err) {
            if (err)
                return done(err);
            done();
        });   
    });

        it('del 79224443322 in stoplist, it should done', function(done){
        sms.stoplistDel(
        {
            phone: '79224443322',
        }, function (err) {
            if (err)
                return done(err);
            done();
        });   
    });
});

describe('sms.stoplist doesn\'t contain', function(done){
    it('stoplist should be an array and doesn\'t contain phones which we added before', function(done){
        sms.stoplist(function (err, stoplist) {
            if (err)
                return done(err);
            stoplist.should.be.an.Array;
            stoplist.should.not.containEql({
                phone: '79218854433',
                reason: 'banned for test'
            });
            stoplist.should.not.containEql({
                phone: '79267622297',
                reason: 'banned for test'
            });
            stoplist.should.not.containEql({
                phone: '79224443322',
                reason: ''
            });
            
            done();
        });
    
    });

});


var sms2 = new (require('../index.js'))(
{
    login: login,
    password: password,
});

describe('check protected authorization with login and password', function(done){
    this.timeout(2000);

    it('check chould done', function(done){
        sms2.auth.should.have.property('login');
        sms2.auth.should.have.property('token');
        sms2.auth.should.have.property('sha512');
        sms2.auth.should.not.have.property('api_id');
        sms2.auth.should.not.have.property('password');

            sms2.check(function(err){
                if(err)
                    return done(err);
                done();     
            });
        });
});

var sms3 = new (require('../index.js'))(
{
    api_id: api_id,
    login: login,
    password: password
});

describe('(not recommended)check protected authorization with  login, password and api_id', function(done){
    this.timeout(900);

    it('check chould done', function(done){
        sms2.auth.should.have.property('login');
        sms2.auth.should.have.property('token');
        sms2.auth.should.have.property('sha512');
        sms2.auth.should.not.have.property('api_id');
        sms2.auth.should.not.have.property('password');
        setTimeout(function(){
            sms2.check(function(err){
                if(err)
                    return done(err);
                done();     
            });
        });
    }, 900);
});
