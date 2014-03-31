var client = require('redis').createClient();

client.del('roach:jobs:pending', function(err) {
	client.set('roach:jobs:id', 0, function() {
		process.exit();
	});
});