var Amqp = require('amqp'),

    Event = require('events').EventEmitter,

    _ = require('underscore');


//monitor logs the queue
module.exports = (function () {


    var _defaults = {
          protocol : 'amqp',
          host : 'localhost',
          port : '5672',
          exhange : 'crawler',
          login: 'guest',
          password: 'guest',
          vhost: '/',
          routingKey: '#'
        },

        _options = null,

        _exchange = null,

        _connection = null,

        _events = new Event();


    /**
     * @class Rabbit Constructor
     */
    function Rabbit( $config ) {

        //default options?
        _setup($config);

    }

    /**
     * Setup connection options.
     * Merge with default options.
     * @param  {Object} options 
     */
    function _setup( options ) {

        _options = _.extend(_defaults, options);

    }

    /**
     * Listen for queue events.
     * @param {String} event's name
     * @param {Function} callback's function
     * @type {[type]}
     */
    Rabbit.prototype.on = function( name, callback, scope ) {

        _events.on( name, _.bind( callback, scope ) );

    };


    /**
     * Init queue connection and listen
     * queue events.
     */
    Rabbit.prototype.init = function() {

        _connection = Amqp.createConnection(
            _options,
            {
                defaultExchangeName : _options.exchange
            }
        );

        _connection.on( 'ready', _ready );

        _connection.on( 'end', _end );

        _connection.on( 'close', _close );

        _connection.on( 'error', _error );

    };


    /**
     * Publish data to the queue
     * @param  {object or array} the data
     */
    Rabbit.prototype.save = function( data ) {

        _exchange.publish(_options.routingKey, JSON.stringify(data)).on('ack', _ack);

    };

    /**
     * Close handler and emit close event.
     */
    Rabbit.prototype.close = function() {

        // `connection.end` doesn't flush outgoing buffers, run a
        // synchronous command to comprehend

        _connection.queue('tmp-' + Math.random(), {exclusive: true}, function(){
            _connection.end();

            // `connection.end` in 0.1.3 raises a ECONNRESET error, silence it:
            _connection.once('error', function(e){
                if (e.code !== 'ECONNRESET' || e.syscall !== 'write')
                    throw e;
            });
        });

    };


    /**
     * Exchange connection and emit ready.
     */
    function _ready() {
        var self = this;

        _connection.exchange(
            _options.exchange,
            {
                durable : true,
                confirm : true
            },
            function( exchange ) {

                _exchange = exchange;
                
                _events.emit( 'ready ' );

            }
        );
    }

    /**
     * RabbitMQ Ack handler.
     */
    function _ack() {
        // Do something after confirmed publish
    }

    /**
     * End handler and emit end event.
     */
    function _end() {

        _events.emit( 'end' );

    }

    /**
     * Close handler and emit close event.
     */
    function _close() {

        // _events.emit( 'close' );

    }

    /**
     * Error handler and emit error event.
     */
    function _error() {

        _events.emit( 'error' );

    }

    return Rabbit;

})();