var _ = require('underscore');


//monitor logs the Logger
module.exports = (function () {

    /**
     * @class Logger Constructor
     */
    function Logger( $emitter, $config ) {

        this._emitter = $emitter;

        this._defaults = {
            name : 'logger'
        };

        //default options?
        this._options = _.extend(this._defaults, $config);

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

        console.time('logger');

        this._emitter.emit( 'ready', this._options.name );

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

        
        console.timeEnd('logger');

        this._emitter.emit('close');

    };

    return Logger;

})();
