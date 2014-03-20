var roach = require('../..');

var job = module.exports = roach.job();

job.on('start', function() {
	console.log('stocks');
});