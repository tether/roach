var mongo = require('mongoskin'),

    EventEmitter = require('events').EventEmitter,

    _ = require('underscore'),

    Door = require('doors');


/**
 * @class Mongo Constructor
 */
function Mongo( $emitter, $config ) {

    this._defaults = {
      protocol : 'mongo',
      name: 'mongodb',
      host : 'localhost',
      port : '27017',
      db: 'crawler',
      collection: 'crawler',
      safe: true
    },

    this._connection = null,

    this._db = null,

    // We hold a reference to a singleton event emitter. We also don't inherit from
    // EventEmitter because we want to set the scope for the on() function
    this._emitter = new EventEmitter();

    this._dataId = 0;

    // Merge in our default options
    this.options = _.extend(this._defaults, $config);

    this.savedDoor = new Door(this.options.name);

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

Mongo.prototype.getSentData = function(){

  return this._dataId;

};

Mongo.prototype.getSavedData = function(){

  return this.doors.getLocks().length;

};

/**
 * Insert data into the data mongo
 * mongo events.
 */
Mongo.prototype.save = function( data ) {

  var self = this,

      name = "data:" + this._dataId;

    this.savedDoor.addLock(name);

    this._db.collection(this.options.collection).insert(data, function(error, document) {

      if (error) self._emitter.emit('error', error);

      self.savedDoor.unlock(name);

      console.log('Transport ' + self.options.name + ' Saved: ' + document);

    // TODO: Maybe we also emit a saved event
    // self._emitter.emit('saved', document);

  });

    this._dataId++;

};


/**
 * Close handler and emit close event.
 */
Mongo.prototype.close = function() {

  var self = this;

  console.log('Close DB');

  this._db.close(function(error){

      if (error) self._emitter.emit('error', error);

      self._emitter.emit( 'close' );

  });

};

module.exports = Mongo;
