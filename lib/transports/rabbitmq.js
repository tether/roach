var Amqp = require('amqp'),
    debug = require('debug')('RabbitMQ'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Door = require('doors');


/**
 * @class Rabbit Constructor
 */
function Rabbit( config ) {
  this._defaults = {
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
  },

  this._exchange = null,
  this._connection = null,
  this._dataId = 0,

  // We instantiate an event emitter to emit events.
  // We don't inherit from EventEmitter because we 
  // want to set the scope for the on() function, which
  // as of Node v0.10.9 you can't do.
  this._emitter = new EventEmitter();

  // Merge in our default options
  this.options = _.extend(this._defaults, config);

  this.savedDoor = new Door(this.options.name);

  _.bindAll(this);
}

/**
 * Listen for queue events.
 * @param {String} event's name
 * @param {Function} callback's function
 * @type {[type]}
 */
Rabbit.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};


/**
 * Init queue connection and listen
 * queue events.
 */
Rabbit.prototype.init = function() {
  this._connection = Amqp.createConnection(
      this.options,
      {
          defaultExchangeName : this.options.exchange
      }
  );

  this._connection.on( 'ready', this._ready );
  this._connection.on( 'end', this._end );
  this._connection.on( 'close', this._close );
  this._connection.on( 'error', this._error );
};

/**
 * Publish data to the queue
 * @param  {object or array} the data
 */
Rabbit.prototype.save = function( data ) {
  var self = this;
  var name = "data:" + this._dataId;

  this._dataId++;

  this.savedDoor.addLock(name);

  this._exchange.publish(this.options.routingKey, JSON.stringify(data)).on('ack', function(){

      debug("Saved: %s", name);

      self._ack(data, name, self);
  });
};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype.close = function() {
  this._connection.end();
};


/**
 * Exchange connection and emit ready.
 */
Rabbit.prototype._ready = function() {
  var self = this;

  this._connection.exchange( this.options.exchange.name, this.options.exchange.options, function( exchange ) {
    self._exchange = exchange;
    self._emitter.emit( 'ready', self.options.name );
  });
};

/**
 * RabbitMQ Ack handler.
 */

Rabbit.prototype._ack = function(document, name, self) {
  this.savedDoor.unlock(name);

  // TODO: Maybe emit a saved event
};

/**
 * End handler and emit end event.
 */
Rabbit.prototype._end = function() {
  debug("End Connection");
  this._emitter.emit( 'close' );
};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype._close = function() {
  debug("Closed Connection");
  this._emitter.emit( 'close' );
};

/**
 * Error handler and emit error event.
 */
Rabbit.prototype._error = function(error) {
  debug("Error: %s", error);
  this._emitter.emit( 'error', error );
};

module.exports = Rabbit;
