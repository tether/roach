var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Door = require('doors');


/**
 * @class File Constructor
 */
function File( config ) {
  this._defaults = {
    path : path.resolve('/tmp'),
    name: 'file',
    filename: 'data:'
  },

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
 * Listen for file system events.
 * @param {String} event's name
 * @param {Function} callback's function
 * @type {[type]}
 */
File.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};


/**
 * Init file system directory
 */
File.prototype.init = function() {
  var directory = this.options.path;
  // We are using the synchronous file system API so that
  // we don't have to have a callback for this function and
  // can keep a consistent API between all transports

  // Setup this.options.path to make sure we can write to it
  if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
  }
};

/**
 * Save data to disk
 * @param  {object or array} the data
 */
File.prototype.save = function( data ) {
  var self = this;

  var name = this.options.filename;
      name += this._dataId;

  this.savedDoor.addLock(name);

  fs.writeFile(name, data, function(error){

      if (error) self._emitter.emit('error', error);

      // console.log('Transport ' + self.options.name + ' Saved: ' + document);

      self.savedDoor.unlock(name);
  });

  this._dataId++;
};

/**
 * Close handler and emit close event.
 */
File.prototype.close = function() {
  this._emitter.emit('close');
};

module.exports = File;