var Emitter = require('component-emitter');

/**
 * Expose 'Job'
 */

module.exports = Job;


/**
 * Job constructor.
 * @api public
 */

function Job() {
  //do something
}

//inherite from emitter

Emitter(Job.prototype);