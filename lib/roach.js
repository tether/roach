var Door = require('doors'),

    EventEmitter = require('events').EventEmitter,

    Job = require('./job'),

    path = require('path'),

    _ = require('underscore');


function Roach() {

    this._transportsReadyDoor = new Door('transportsReady');

    this._transportsDoneDoor = new Door('transportsDone');

    this._jobsDoor = new Door('jobs');

    // This emitter is a singleton as is passed to all the transports
    this._emitter = new EventEmitter();

    this._transports = {};

    this._jobs = [];

    this._jobsDoor.on('open', this.jobDoorOpen);
}

Roach.prototype.config = function(configFile) {

    var filePath = configFile;

    // Parse the payload passed in from CLI or Iron.io.
    var payloadIndex = process.argv.indexOf('-payload');

    if (payloadIndex !== -1){
        payloadIndex += 1;
        filePath = process.argv[payloadIndex];
    }

    // We are intentionally using the synchronous readFile because
    // we don't want anything else to proceed until we have pulled in
    // the config options.
    var file = fs.readFileSync( path.resolve(process.cwd(), filePath), { encoding: 'ascii' } );

    return file ? JSON.parse(file) : {};
};

/**
 * Chain the transports that you want to use
 * @param  {string} transport name
 * @param  {object} options to pass to the transport
 * @return {this} this roach
 */
Roach.prototype.use = function( transport, options ) {

    var transportPath = path.resolve(__dirname, 'transports', transport);

    // TODO (EK): Maybe return a nice error if transport doesn't exist rather than
    // just letting node bomb

    if ( require.resolve(transportPath) ){


        var Transport = require(transportPath);

        this._transports[transport] = new Transport(this._emitter, options);

        this._transportsReadyDoor.addLock(transport);

        this._transportsDoneDoor.addLock(this._transports[transport].savedDoor);

        // Listen for 'ready' event from the transport and unlock the transport
        this._transports[transport].on('ready', this.transportReady);

        // Listen for 'error' event from the transport
        this._transports[transport].on('error', this.errorHandler);

    }

    return this;
};

/**
 * Run a job
 * @param  {object} the job to run
 */
Roach.prototype.run = function() {

    if ( !this._transportsReadyDoor.isOpen ){

        this._transportsReadyDoor.once('open', this.transportOpen);
    }

    _.each( this._transports, function(transport) {

        transport.init();

    } );
};

Roach.prototype.errorHandler = function(error) {
    console.log('ERROR', error);

    // TODO (EK): Handle errors a little nicer. We should log them
    // and then maybe send to a configurable logger transport. In
    // the mean time we need to exit with an error for iron.io to be able
    // to notify if an error occurred properly.

    process.exit(1);
};

Roach.prototype.jobExit = function(name) {
    this._jobsDoor.unlock(name);
};

Roach.prototype.jobParsed = function(type, data) {
    this.save(data);
};

Roach.prototype.jobDoorOpen = function() {
    if (this._transportsDoneDoor.isOpen) {
        this.close();
    }
    else {
        this._transportsDoneDoor.on('open', this.close);
    }
};

/**
 * Add a job to run
 * @param  {object} the job to add
 */
Roach.prototype.addJob = function( url, name, options ) {

    var job = (url instanceof Job) ? url : new Job(url, name);

    job.on('job:parsed', this.jobParsed, this);

    job.on('error', this.errorHandler, this);

    job.on('exit', this.jobExit, this);

    this._jobs.push(job);

    this._jobsDoor.addLock(name);

    return job;

};

Roach.prototype.transportReady = function(name) {
    // console.log('Transport ' + name + ' ready');

    this._transportsReadyDoor.unlock(name);
};

Roach.prototype.transportOpen = function() {

    _.each(this._jobs, function(job){

        job.run();

    });
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