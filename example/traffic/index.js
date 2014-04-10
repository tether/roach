var roach = require('../..');
var job = module.exports = roach.job();

//parse file on start

job.start(function() {
	job.log('start stocks');
	var i = 10;
	var interval = setInterval(function() {
		if(i === 100) clearInterval(interval);
		job.progress(i, 100);
		job.data('traffic');
		i = i + 10;
	}, 1000);
});


//test steps
job.step(function() {
	console.log('step1');
}, function() {
	console.log('step1 bis');
}, function() {
	console.log('step1 bis bis');
});

job.step(function(data) {
	console.log('step2');
});

job.emit('job run');