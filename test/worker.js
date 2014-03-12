var roach = require('..'),
Worker = require('../lib/worker'),
assert = require('assert');

describe("Worker", function() {
	var worker, job, client;
	beforeEach(function() {
		job = {};
		worker = new Worker(job);
		client = worker.client;
	});

	afterEach(function() {
		client.quit();
	});

	it("should create a redis client", function(done) {
		client.hset("hash key", "hashtest 1", "some value");
		client.hkeys("hash key", function (err, replies) {
			if(replies[0] === "hashtest 1") done();
		});
	});
	
});
