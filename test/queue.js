var Queue = require('../lib/queue'),
		assert = require('assert'),
		redis = require('redis');

var client = redis.createClient();

describe("Add", function() {
	var queue;
	beforeEach(function() {
		Queue.key = 'test:jobs';
		queue = new Queue();
	});

	afterEach(function() {
		client.lpop(Queue.key);
	});
	
	it("should add a job into the queue list", function(done) {

		queue.add('test', function(err, r) {
			client.lrange(Queue.key, 0, 0, function(err, res) {
				if(res[0] === 'test') done();
			});
		});

	});
	
	// it('should increment a job id key', function(done) {
	// 	client.exists('roach:jobs:id', function(err, res) {
	// 		if(res === 1) done();
	// 	});
	// });
});
