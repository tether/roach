var roach = require('../..');

var job = module.exports = roach.job();

job.on('start', function() {
	console.log('stocks start');
	progress();
});

function progress() {
	var i = 0;
	var interval = setInterval(function() {
		job.progress(i, 100);
		i = i + 10;
		if(i === 100) {
			clearInterval(interval);
	    job.stop();
		}
	}, 1000);
}