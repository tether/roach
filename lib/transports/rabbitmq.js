var Amqp = require('amqp'),

    _ = require('underscore');



/**
 * @class Rabbit Constructor
 */
function Rabbit( $emitter, $config ) {

    this._defaults = {
      protocol : 'amqp',
      host : 'localhost',
      port : '5672',
      exhange : 'crawler',
      login: 'guest',
      password: 'guest',
      vhost: '/',
      routingKey: '#'
    },

    this._exchange = null,

    this._connection = null,

    this._db = null,

    // We hold a reference to a singleton event emitter that is shared
    // between roach and all the transports. We also don't inherit from
    // EventEmitter because we want to set the scope for the on() function
    this._emitter = $emitter;

    _emitter = this._emitter;

    // Merge in our default options
    this.options = _.extend(this._defaults, $config);

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

    this._connection.on( 'ready', _ready );

    this._connection.on( 'end', _end );

    this._connection.on( 'close', _close );

    this._connection.on( 'error', _error );

};

/**
 * Publish data to the queue
 * @param  {object or array} the data
 */
Rabbit.prototype.save = function( data ) {

    this._exchange.publish(this.options.routingKey, JSON.stringify(data)).on('ack', _ack);

};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype.close = function() {

    // `connection.end` doesn't flush outgoing buffers, run a
    // synchronous command to comprehend

    this._connection.queue('tmp-' + Math.random(), {exclusive: true}, function(){
        this._connection.end();

        // `connection.end` in 0.1.3 raises a ECONNRESET error, silence it:
        this._connection.once('error', function(e){
            if (e.code !== 'ECONNRESET' || e.syscall !== 'write')
                throw e;
        });
    });

};


/**
 * Exchange connection and emit ready.
 */
Rabbit.prototype._ready = function() {
    var self = this;

    this._connection.exchange(
        this.options.exchange,
        {
            durable : true,
            confirm : true
        },
        function( exchange ) {

            this._exchange = exchange;

            this._emitter.emit( 'ready ' );

        }
    );
};

/**
 * RabbitMQ Ack handler.
 */

Rabbit.prototype._ack = function() {
    // Do something after confirmed publish
};

/**
 * End handler and emit end event.
 */
Rabbit.prototype._.end = function() {

    this._emitter.emit( 'end' );

};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype._close = function() {

    this._emitter.emit( 'close' );

};

/**
 * Error handler and emit error event.
 */
Rabbit.prototype._error = function() {

    this._emitter.emit( 'error' );

};

module.exports = Rabbit;