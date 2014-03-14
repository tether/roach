var Queue = require('../lib/queue'),
		assert = require('assert'),
		redis = require('redis');

var client = redis.createClient();

describe("Initialization", function() {
	var queue;
	beforeEach(function() {
		queue = new Queue();
	});
	
	it('should initialize a job id key', function(done) {
		client.exists('roach:jobs:id', function(err, res) {
			if(res === 1) done();
		});
	});
});
