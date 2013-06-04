var mongo = require('mongoskin'),

    _ = require('underscore');


/**
 * @class Mongo Constructor
 */
function Mongo( $emitter, $config ) {

    this._defaults = {
      protocol : 'mongo',
      host : 'localhost',
      port : '27017',
      db: 'crawler',
      collection: 'crawler',
      safe: true
    },

    this._connection = null,

    this._db = null,

    // We hold a reference to a singleton event emitter that is shared
    // between roach and all the transports. We also don't inherit from
    // EventEmitter because we want to set the scope for the on() function
    this._emitter = $emitter;

    // Merge in our default options
    this.options = _.extend(this._defaults, $config);

}

/**
 * Listen for mongo events.
 * @param {String} event's name
 * @param {Function} callback's function
 * @type {[type]}
 */
Mongo.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};


/**
 * Init mongo connection and listen
 * mongo events.
 */
Mongo.prototype.init = function() {

    var connectionString = this.options.protocol + '://' + this.options.host + ':' + this.options.port + '/' + this.options.db;

    this._db = mongo.db( connectionString, { safe: this.options.safe } );

    this._emitter.emit( 'ready', this.options.name );

};

/**
 * Insert data into the data mongo
 * mongo events.
 */
Mongo.prototype.save = function( data ) {

    this._db.collection(this.options.collection).insert(data, function(error, document) {

        if (error) this._emitter.emit('error', error);

        this._emitter.emit('saved', document);

    });

};


/**
 * Close handler and emit close event.
 */
Mongo.prototype.close = function() {

    this._db.close(function(error){

        if (error) this._emitter.emit('error', error);

        this._emitter.emit( 'close' );

    });

};

module.exports = Mongo;
