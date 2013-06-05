var Amqp = require('amqp'),

    EventEmitter = require('events').EventEmitter,

    _ = require('underscore'),

    Door = require('doors');



/**
 * @class Rabbit Constructor
 */
function Rabbit( $emitter, $config ) {

    this._defaults = {
      protocol : 'amqp',
      name: 'rabbitmq',
      host : 'localhost',
      port : '5672',
      exchange : 'petrofeed_crawler',
      login: 'guest',
      password: 'guest',
      vhost: '/',
      routingKey: 'well.ca.ab'
    },

    this._exchange = null,

    this._connection = null,

    this._dataId = 0,

    // We hold a reference to a singleton event emitter. We also don't inherit from
    // EventEmitter because we want to set the scope for the on() function
    this._emitter = new EventEmitter();

    // Merge in our default options
    this.options = _.extend(this._defaults, $config);

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

        console.log('RabbitMQ Save', data);

        self._ack(data, name);
    });

};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype.close = function() {

    var self = this;
    // `connection.end` doesn't flush outgoing buffers, run a
    // synchronous command to comprehend

    this._connection.end();

    // this._connection.queue('tmp-' + Math.random(), {exclusive: true}, function(){
    //     self._connection.end();

    //     // since 0.1.3 `connection.end` raises a ECONNRESET error, silence it:
    //     self._connection.once('error', function(e){
    //         if (e.code !== 'ECONNRESET' || e.syscall !== 'write')
    //             throw e;
    //     });
    // });

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

            self._exchange = exchange;

            self._emitter.emit( 'ready', self.options.name );

        }
    );
};

/**
 * RabbitMQ Ack handler.
 */

Rabbit.prototype._ack = function(document) {

    this.savedDoor.unlock(name);

    console.log('Rabbit Locks', this.savedDoor.getLocks().length);

    console.log('Transport ' + this.options.name + ' Saved: ' + document);

    // TODO: Maybe emit a saved event

};

/**
 * End handler and emit end event.
 */
Rabbit.prototype._end = function() {

    console.log('RabbitMQ End');

    this._emitter.emit( 'close' );

};

/**
 * Close handler and emit close event.
 */
Rabbit.prototype._close = function() {

    console.log('RabbitMQ Close');

    this._emitter.emit( 'close' );

};

/**
 * Error handler and emit error event.
 */
Rabbit.prototype._error = function(error) {

    console.log('RabbitMQ ERROR', error);

    this._emitter.emit( 'error', error );

};

module.exports = Rabbit;