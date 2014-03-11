var Door = require('doors');
var debug = require('debug')('Roach');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Job = require('./job');
var _ = require('lodash');
var Scheduler = require('./scheduler');


/**
 * Roach Constructor
 *
 * Roach is the glue between the jobs and the transports
 *
 * @api public
 */
function Roach() {
  this.scheduler = new Scheduler();
  this._transports = {};

  this._transportsReadyDoor = new Door('transportsReady');
  this._transportsDoneDoor = new Door('transportsDone');

  // This emitter is a singleton and is passed to all the transports
  this._emitter = new EventEmitter();

  // Events
  this.scheduler.on('job:data', this.save, this);
}


/**
 * Chain the transports that you want to use
 *
 * @param  {string} transport name
 * @param  {object} options to pass to the transport
 * @return {Roach} this
 */
Roach.prototype.use = function( transport, options ) {
  var transportPath = path.resolve(__dirname, 'transports', transport);

  try {
    if ( require.resolve(transportPath) ){
      var Transport = require(transportPath);

      this._transports[transport] = new Transport(options);

      this._transportsReadyDoor.addLock(transport);

      this._transportsDoneDoor.addLock(this._transports[transport].savedDoor);

      // Listen for 'ready' event from the transport and unlock the transport
      this._transports[transport].on('ready', _.bind(this.transportReady, this));

      // Listen for 'error' event from the transport
      this._transports[transport].on('error', _.bind(this.errorHandler, this));
    }
  } catch(e) {
    console.log("An error occurred trying to add the %s transport:\n  %s", transport, e);
    debug(e);
  }

  return this;
};


/**
 * Start roach itself. Initialize all the transports that were configured.
 *
 */
Roach.prototype.start = function() {
  _.each( this._transports, function(transport) {
    transport.init();
  });
};


/**
 * Schedule a job (crawler) to be run at its scheduled time.
 * 
 * @param  {Job} job - a generic job or a crawler
 * @return {Job} - the scheduled job
 */
Roach.prototype.schedule = function(job){
  // TODO (EK): If job is a crawler name then look it up 
  // from our default crawlers or path.
  
  if (this._transportsReadyDoor.isOpen) {
    this.scheduler.schedule(job);
  }
  else {
    debug("Error: %s", 'Transports are not ready!');
  }
};


/**
 * Event Handlers
 * ------------------------------------------
 */
Roach.prototype.errorHandler = function(error) {
  debug("Error: %s", error);
};


/**
 * Save the data to the transports.
 * 
 * @param  {string} type - the type of data
 * @param  {object} data - the data to be saved
 */
Roach.prototype.save = function(type, data) {
  _.each(this._transports, function(transport){
    transport.save( data );
  });
};


Roach.prototype.jobDone = function(name) {
  debug("Job '%s' Complete", name);

  // TODO (EK): Maybe email someone or something to let them know
};


Roach.prototype.transportReady = function(name) {
  debug("Transport '%s' ready", name);

  this._transportsReadyDoor.unlock(name);
};


// Roach.prototype.jobDoorOpen = function() {
//   // If the document never
//   if (_.keys(this._jobs).length === 1 && !_.values(this._jobs)[0].parseTriggered){
//     this.close();
//   }
//   else if (this._transportsDoneDoor.isOpen) {
//     this.close();
//   }
//   else {
//     this._transportsDoneDoor.on('open', _.bind(this.close, this) );
//   }
// };


// Roach.prototype.transportOpen = function() {
//   for (var i in this._jobs){
//     this._jobs[i].run();
//   }
// };


// Roach.prototype.close = function() {
//   _.each(this._transports, function(transport){
//     transport.close();
//   });

//   process.exit();
// };

module.exports = new Roach();
