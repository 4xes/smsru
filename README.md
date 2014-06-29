smsru
======
node js модуль для работы с API сервиса [sms.ru](http://sms.ru)

## Установка
```
npm i smsru
```
## Использование
Простая авторизация (с помощью api_id):
```js
var sms = new (require('smsru'))({
    api_id   : '{api_id}'
});
```
Усиленная авторизация (с помощью логина и пароля):
```js
var sms = new (require('smsru'))({
    login   : '{login}',
    password: '{password}'
    // модуль автоматически обновляет авторизацию каждые 10 минут
    //,autoToken: false для отключения обновления авторизации
```
(не рекомендуется)Усиленная авторизация (с помощью api_id, логина и пароля):
```js
var sms = new (require('smsru'))({
    api_id  : '{api_id}'
    login   : '{login}',
    password: '{password}'
    // модуль автоматически обновляет авторизацию каждые 10 минут
    //,autoToken: false для отключения обновления авторизации
});
```
Отправка СМС:
```js
sms.send({
    to: '79112223344,79115556677,79115552255',
    text: 'Hello Kitty!',
    from: 'Имя отправителя',
    time: 60*20*1000, //отложенная отправка, в данном случае, через 20 минут в миллисекундах 
    translit: false,
    test: false,
    partner_id: '58239' //[партнерка, скидка 10%](http://foxes.sms.ru)
  },
  function(err, id){
    if(err)
      console.log(err.message);
    console.log('id смс сообщения', id);//Например: 22125-2345258
});
```
Получения статуса СМС:
```js
sms.status(id, function(err, result){
  if(err)
    return console.log(err.message);
  //100	Сообщение находится в нашей очереди
  //101	Сообщение передается оператору
  //102	Сообщение отправлено (в пути)
  //103	Сообщение доставлено
  console.log('Статус',result);
});
```
Получить стоимость отправки СМС:
```js
sms.cost({
    to:   '+79252846225',
    text: 'Hello Kitty!'
},
  function(err, price, length){
    if(err)
      return console.log(err.message);
    console.log(price, length);
});
```
Баланс:
```js
sms.balance(function(err, balance){
  if(err)
    return console.log(err.message);
  console.log('Баланс', balance); // Float
});
```
Дневной лимит:
```js
sms.limit(function(err, availableDay, spentDay){
  if(err)
    return console.log(err.message);
  //availableDay - количество номеров, на которые вы можете отправлять сообщения внутри дня
  //spentDay - количество номеров, на которые вы уже отправили сообщения внутри текущего дня
  console.log(availableDay,spentDay); // Numbers
});
```
Отправители:
```js
sms.senders(function(err, senders){
  if(err)
    return console.log(err.message);
  console.log(senders); //Array ['79823555523','']
});
```
Проверка валидности авторизации:
```js
sms.check(function(err){
  if(err)
    return console.log(err.message);
  console.log('Авторизовано');    
});
```
Добавить номер в стоплист:
```js
sms.stoplistAdd(
{
  phone: '79224443322',
  reason: 'ban for flood' //можно без reason
}, function (err) {
  if (err)
    return console.log(err.message);
  console.log('Номер 79224443322 удален из стоп-листа');
});
```
Получить номера стоплиста:
```js
sms.stoplist(function (err, stoplist) {
  if (err)
    return console.log(err.message);
  console.log('Стоп-лист', stoplist); // Array [{phone: '79224443322', reason:'ban for flood'}]
});
```
Удалить номер из стоплиста:
```js
sms.stoplistDel({phone: '79224443322',}, function (err) {
  if (err)
    return console.log(err.message);
  console.log('Номер 79224443322 удален из стоп-листа');
});   
```
## Автор
[Alexey Petrushin](https://github.com/4xes/), e-mail: [a.petrushin@live.com](mailto:a.petrushin@live.com)