var Door = require('doors'),

    EventEmitter = require('events').EventEmitter,

    Job = require('./job'),

    path = require('path'),

    _ = require('underscore');


function Roach() {

    var self = this;

    this._transportsReadyDoor = new Door('transportsReady');

    this._transportsDoneDoor = new Door('transportsDone');

    this._jobsDoor = new Door('jobs');

    // This emitter is a singleton as is passed to all the transports
    this._emitter = new EventEmitter();

    this._transports = {};

    this._jobs = [];

    this._emitter.on('parsed', function(type, data){

        self.save(data);
    });

    this._emitter.on('exit', function(name){

        self._jobsDoor.unlock(name);
    });

    this._jobsDoor.on('open', function(){

        self._transportsDoneDoor.on('open', self.close);

    });
}

/**
 * Chain the transports that you want to use
 * @param  {string} transport name
 * @param  {object} options to pass to the transport
 * @return {this} this roach
 */
Roach.prototype.use = function( transport, options ) {

    var transportPath = path.resolve(__dirname, 'transports', transport),
        self = this;

    // TODO: Maybe return an error if transport doesn't exist

    if ( require.resolve(transportPath) ){


        var Transport = require(transportPath);

        this._transports[transport] = new Transport(this._emitter, options);

        this._transportsReadyDoor.addLock(transport);

        this._transportsDoneDoor.addLock(this._transports[transport].savedDoor);

        // Listen for 'ready' event from the transport and unlock the transport
        this._transports[transport].on('ready', function(name){

            self._transportsReadyDoor.unlock(name);

        });

        // Listen for 'error' event from the transport
        this._transports[transport].on('error', function(error){

            console.log('ERROR', error);

        });

    }

    // TODO: Listen for 'data' event from the transport

    return this;
};

/**
 * Run a job
 * @param  {object} the job to run
 */
Roach.prototype.run = function() {

    var self = this;

    _.each( this._transports, function(transport) {

        transport.init();

    } );

    if ( !this._transportsReadyDoor.isOpen ){

        return this._transportsReadyDoor.once('open', function(){

            _.each(self._jobs, function(job){

                job.run();

            });
        });

    }
};

/**
 * Add a job to run
 * @param  {object} the job to add
 */
Roach.prototype.addJob = function( url, name, options ) {

    var job = (url instanceof Job) ? url : new Job(url, name);

    job.setEmitter(this._emitter);

    this._jobs.push(job);

    //FIX THIS, can't have an id 0
    this._jobsDoor.addLock(name);

    return job;

};


Roach.prototype.save = function( data ) {

    _.each(this._transports, function(transport){

        transport.save( data );

    });
};


Roach.prototype.close = function() {

    _.each(this._transports, function(transport){

        transport.close();

    });

    process.exit();
};

module.exports = Roach;