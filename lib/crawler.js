var Door = require('doors'),

    Promise = require('promises'),

    _ = require('underscore');


module.exports = (function () {

    var _door = new Door('crawler'),

        _promise = new Promise(),

        _transports = {},

        _callbacks = {},

        _jobs = [];


    function Crawler() {

        _door.on('open', function(){

            _promise.resolve();

        });
    }


    /**
     * Chain the transports that you want to use
     * @param  {string} transport name
     * @param  {object} options to pass to the transport
     * @return {this} this crawler
     */
    Crawler.prototype.use = function( transport, options ) {

        var transportPath = './transports/' + transport;

        // TODO: Maybe return an error if transport doesn't exist

        if ( require.resolve(transportPath) ){

            var Transport = require(transportPath);

            _transports[transport] = new Transport(options);

            _door.addLock(transport);

            // Listen for 'ready' event from the transport and unlock the transport
            _transports[transport].on('ready', function(){

                _door.unlock(transport);

            });

            // Listen for 'error' event from the transport
            _transports[transport].on('error', function(error){

                _promise.unresolve();

            });

        }

        // TODO: Listen for 'data' event from the transport

        return this;
    };

    /**
     * Run a job
     * @param  {object} the job to run
     */
    Crawler.prototype.run = function( job ) {
        // body...
    };

    /**
     * Add a job to run
     * @param  {object} the job to add
     */
    Crawler.prototype.addJob = function( job ) {

        _jobs.push(job);

    };

    Crawler.prototype.then = function( success, error ) {


        _.each( _transports, function(transport) {

            transport.init();

        } );

        _promise.then(success, error);

        return this;

    };

    return Crawler;

})();