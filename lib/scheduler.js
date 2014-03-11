var Door = require('doors');
var debug = require('debug')('Scheduler');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var kue = require('kue');

/**
 * Scheduler Constructor
 *
 * Scheduler is the glue between the jobs and the transports
 *
 * @api public
 */
function Scheduler(options) {
  this._defaults = {
    priority: 'normal',
    attempts: 3,
    concurrency: 1
  };

  // This emitter is a singleton and is passed to all the transports
  this._emitter = new EventEmitter();

  this._jobs = kue.createQueue();

  // Events
  this._emitter.on('job:added', _.bind(this._run, this) );
  this._emitter.on('job:done', _.bind(this._run, this) );

  this.options = _.extend(this._defaults, options);
}

Scheduler.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};


/**
 * Schedule a job (crawler) to be run at its scheduled time.
 * 
 * @param  {Job} job - a generic job or a crawler
 * @return {Job} - the scheduled job
 * @api public
 */
Scheduler.prototype.schedule = function(crawler){
  // TODO (EK): Set it up to run right away
  crawler.schedule = crawler.schedule || 'now';
  crawler.priority = crawler.priority || this._defaults.priority;
  crawler.attempts = crawler.attempts || this._defaults.attempts;
  crawler.concurrency = crawler.concurrency || this._defaults.concurrency;

  // TODO (EK): Generate a unique name for the job
  // job.title = new uuid();

  // Add crawler to the job queue
  var job = this._jobs.create(crawler.title, crawler)
                //TODO (EK): Use schedule to set the next time
                // to run and how long from now
                // .delay(crawler.schedule)
                .priority(crawler.priority)
                .attempts(crawler.attempts);

  // Bind to events for that job
  job.on('data', this.jobData, this);
  job.on('promotion', this.jobPromoted, this);
  job.on('progress', this.jobProgress, this);
  job.on('failed', this.jobFailed, this);
  job.on('complete', this.jobComplete, this);

  job.save();

  this._jobs.process(crawler.title, crawler.concurrency, crawler.run);
  // this._emitter.emit('job:added');

  debug("Job %s Scheduled", job.name);

  return job;
};


/**
 * Gets the next job in the queue
 * 
 * @return {Job} - the next job
 * @api public
 */
Scheduler.prototype.nextJob = function() {
  return this._jobs[_.first(this._queue)];
};


/**
 * Gets the next job in the queue
 * 
 * @return {Job} - the next job
 * @api public
 */
Scheduler.prototype.currentJob = function() {
  return this._currentJob;
};


/**
 * This kicks off the jobs. It initializes all the transports which, when
 * done, runs all the jobs.
 *
 * @api private
 */
Scheduler.prototype._run = function() {
  // As long as the queue is not empty and there isn't a current job
  // keep pulling jobs off the queue and running them.

  if (!this._currentJob && this._queue.length) {
    var jobName = this._queue.shift();
    this._currentJob = this._jobs[jobName];
    delete this._jobs[jobName];

    this._currentJob.run();
  }
};


/**
 * Event Handlers
 * ------------------------------------------
 */
Scheduler.prototype.jobPromoted = function(name) {
  debug("Job '%s' Promoted", name);
};

Scheduler.prototype.jobProgress = function(progress, name) {
  console.log(progress, name);
    
  debug("Job '%s'% Complete", progress);

  this._emitter.emit('job:progress', name);
};

Scheduler.prototype.jobFailed = function(error) {
  debug("Error: %s", error);

  // TODO (EK): Handle errors a little nicer. We should log them
  // and then maybe send to a configurable logger transport. In
  // the mean time we need to exit with an error for iron.io to be able
  // to notify if an error occurred properly.
};

Scheduler.prototype.jobComplete = function(name) {
  debug("Job '%s' Complete", name);

  // This is to handle empty jobs
  // if (!this._jobs[name].parseTriggered){
  //   debug("Job '%s' with URL: %s Finished without parsing anything", name, this._jobs[name]._url);
  // }

  this._emitter.emit('job:complete', name);
};

Scheduler.prototype.jobData = function(type, data) {
  // Re-emit this event for Roach to save to the transports
  this._emitter.emit('job:data', type, data);
};

module.exports = Scheduler;
