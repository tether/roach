var roach = require('../..'),
		client = require('redis').createClient();

var job = module.exports = roach.job();

job.on('start', function() {
	console.log('stocks');
});

client.on('message', function(channel, message) {
	console.log(channel, message);
});

client.subscribe("channel");
