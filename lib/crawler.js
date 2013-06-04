var Door = require('doors'),

    Event = require('events').EventEmitter,

    Job = require('./job'),

    // Promise = require('promises'),

    _ = require('underscore');


module.exports = (function () {


    function Crawler() {
        var self = this;

        this._door = new Door('crawler');

        this._emitter = new Event();

        this._transports = {};

        this._jobs = [];

        this._emitter.on('parsed', function(type, data){

            _.each(self._transports, function(transport){

                transport.save(data);

            });

        });

        this._emitter.on('parse:end', function(){

            _.each(self._transports, function(transport){
                transport.close();
            });

        });
    }


    /**
     * Chain the transports that you want to use
     * @param  {string} transport name
     * @param  {object} options to pass to the transport
     * @return {this} this crawler
     */
    Crawler.prototype.use = function( transport, options ) {

        var transportPath = './transports/' + transport,
            self = this;

        // TODO: Maybe return an error if transport doesn't exist

        if ( require.resolve(transportPath) ){

            var Transport = require(transportPath);

            this._transports[transport] = new Transport(this._emitter, options);

            this._door.addLock(transport);

            // Listen for 'ready' event from the transport and unlock the transport
            this._transports[transport].on('ready', function(){

                console.log(transport + ' READY!');

                self._door.unlock(transport);

            });

            // Listen for 'error' event from the transport
            this._transports[transport].on('error', function(error){

                console.log(error);
                // _promise.unresolve();

            });

        }

        // TODO: Listen for 'data' event from the transport

        return this;
    };

    /**
     * Run a job
     * @param  {object} the job to run
     */
    Crawler.prototype.run = function() {

        _.each( this._transports, function(transport) {

            transport.init();

        } );


        if ( !this._door.isOpen ){

            return this._door.once('open', this.run);

        }

        var i = 0;

        _.each(this._jobs, function(job){

            job.run(); // parser.applyFilters()

            // Add a lock to jobs door?

        });
    };

    /**
     * Add a job to run
     * @param  {object} the job to add
     */
    Crawler.prototype.addJob = function( url, name, options ) {

        var job = null;

        if ( url instanceof Job) {
            job = url;
        }
        else {
            job = new Job(url, name);
        }

        job.setEmitter(this._emitter);

        this._jobs.push(job);

        return job;

    };

    return Crawler;

})();