var client = require('redis').createClient();

// client.del('roach:jobs:pending', function(err) {
// 	client.set('roach:jobs:id', 0, function() {
// 		process.exit();
// 	});
// });

// client.del('roach:jobs:active');

// for(var l = 700; l--;) {
// 	client.hdel('roach:jobs:' + l, function() {

// 	});
// }

client.flushall(function() {
	process.exit();
});