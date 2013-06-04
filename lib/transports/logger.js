var _ = require('underscore');


/**
 * @class Logger Constructor
 */
function Logger( $emitter, $config ) {

    this._defaults = {
        name : 'logger'
    };

    // We hold a reference to a singleton event emitter that is shared
    // between roach and all the transports. We also don't inherit from
    // EventEmitter because we want to set the scope for the on() function
    this._emitter = $emitter;

    // Merge in our default options
    this.options = _.extend(this._defaults, $config);

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

    console.log('logger save', data);

    this._emitter.emit('saved');

};


/**
 * Close handler and emit close event.
 */
Logger.prototype.close = function() {

    console.log('logger close');
    this._emitter.emit('close');

};

module.exports = Logger;
