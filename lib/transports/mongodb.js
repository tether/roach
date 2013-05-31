var mongo = require('mongoskin'),

    Event = require('events').EventEmitter,

    _ = require('underscore');


//monitor logs the mongo
module.exports = (function () {


    var _defaults = {
          protocol : 'mongo',
          host : 'localhost',
          port : '27017',
          db: 'crawler',
          collection: 'crawler',
          safe: true
        },

        _options = null,

        _connection = null,

        _events = new Event();


    /**
     * @class Mongo Constructor
     */
    function Mongo( $config ) {

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
     * Listen for mongo events.
     * @param {String} event's name
     * @param {Function} callback's function
     * @type {[type]}
     */
    Mongo.prototype.on = function( name, callback, scope ) {

        _events.on( name, _.bind( callback, scope ) );

    };


    /**
     * Init mongo connection and listen
     * mongo events.
     */
    Mongo.prototype.init = function() {

        var connectionString = _options.protocol + '://' + _options.host + ':' + _options.port + '/' + _options.db;
        
        _db = mongo.db( connectionString, { safe: _options.safe } );

        _events.emit( 'ready', _options.name );

    };

    /**
     * Insert data into the data mongo
     * mongo events.
     */
    Mongo.prototype.save = function( data ) {

        _db.collection(_options.collection).insert(data, function(error, document) {

            if (error) _event.emit('error', error);

            _event.emit('saved', document);

        });

    };


    /**
     * Close handler and emit close event.
     */
    Mongo.prototype.close = function() {

        _db.close(function(error){

            if (error) _event.emit('error', error);

            _events.emit( 'close' );

        });

    };

    return Mongo;

})();
