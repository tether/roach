
/**
 * Dependencies
 * @api private
 */

var roach = require('../..');


//expose job

var job = module.exports = roach.job();


job.on('start', function() {
  progress();
});

function progress() {
  var i = 0;
  var interval = setInterval(function() {
    //job.progress(i, 100);
    i = i + 1;
    if(i === 50) {
      clearInterval(interval);
      job.stop();
    }
    job.data('data index', i);
  }, 50);
}