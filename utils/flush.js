var client = require('redis').createClient();

client.flushall(function() {
	process.exit();
});