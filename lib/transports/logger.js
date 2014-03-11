var _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    Door = require('doors');


/**
 * @class Logger Constructor
 */
function Logger( config ) {
  this._defaults = {
      name : 'logger'
  };

  // We instantiate an event emitter to emit events.
  // We don't inherit from EventEmitter because we 
  // want to set the scope for the on() function, which
  // as of Node v0.10.9 you can't do.
  this._emitter = new EventEmitter();

  this._dataId = 0;

  // Merge in our default options
  this.options = _.extend(this._defaults, config);

  this.savedDoor = new Door(this.options.name);
}

/**
 * Listen for Logger events.
 * @param {String} event's name
 * @param {Function} callback's function
 * @type {[type]}
 */
Logger.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};


/**
 * Init Logger connection and listen
 * Logger events.
 */
Logger.prototype.init = function() {
  this._emitter.emit( 'ready', this.options.name );
};

/**
 * Insert data into the data Logger
 * Logger events.
 */
Logger.prototype.save = function( data ) {
  var name = "data:" + this._dataId;

  this.savedDoor.addLock(name);

  console.log('Transport ' + this.options.name + ' Saved: ' + require('util').inspect(data, true, null, true));

  this.savedDoor.unlock(name);

  this._dataId++;
};


/**
 * Close handler and emit close event.
 */
Logger.prototype.close = function() {
  this._emitter.emit('close');
};

module.exports = Logger;
