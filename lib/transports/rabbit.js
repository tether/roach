
/**
 * Modules dependencies.
 * @api private
 */

var Amqp = require('amqp');
var roach = require('../roach');
var redis = require('redis');


//expose transport

var job = module.exports = roach.job();


// default rabbit config

job.config({
  protocol : 'amqp',
  name: 'rabbitmq',
  host : 'localhost',
  port : '5672',
  exchange : {
    name: 'roach',
    options: {
      durable : true,
      confirm : true
    }
  },
  login: 'guest',
  password: 'guest',
  vhost: '/',
  routingKey: '#'
});


// Setup rabbit connection

var amqp = Amqp.createConnection(job.config(), {
  defaultExchangeName : job.config('exchange').name
});

amqp.on( 'ready', function(){
  var exchangeOptions = job.config('exchange');

  amqp.exchange(exchangeOptions.name, exchangeOptions.options, function(exchange) {
    job.on('data rabbit', function(data){
      exchange.publish(job.config('routingKey'), JSON.stringify(data)).on('ack', function(){
        console.log('Published', data);
          // TODO (EK): Send acknowledgement or remove data from the queue
          // self._ack(data, name, self);
      });
    });
  });
});

// Setup Redis Connection
var client = redis.createClient();
client.psubscribe('roach:job:*:data*');
client.on('pmessage', function(pattern, channel, data){
  job.queue('data rabbit', data);
});


//NOTE: we could send all logs through a redis communication channel
//maybe roach:server (common to every transport and roach server)
job.start(function() {
  console.log('rabbitmq start');
});

amqp.on( 'end', function(){
  console.log('RabbitMQ End Event', arguments);
});
amqp.on( 'close', function(){
  console.log('RabbitMQ Close Event', arguments);
});
amqp.on( 'error', function(){
  console.log('RabbitMQ Error Event');
});
