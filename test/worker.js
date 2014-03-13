var roach = require('..'),
Worker = require('../lib/worker'),
assert = require('assert');

describe("Worker", function() {

	var worker, job, client;
	beforeEach(function() {
		job = roach.job();
		worker = new Worker(job);
		client = worker.client;
	});

	afterEach(function() {
		client.quit();
	});

	it("should be a redis client", function(done) {
		client.hset("hash key", "hashtest 1", "some value");
		client.hkeys("hash key", function (err, replies) {
			if(replies[0] === "hashtest 1") done();
		});
	});

	it("should be a job", function() {
		assert.equal(worker.job, job);
	});

	it('should be inactive by default', function() {
		assert.equal(worker.state, 'inactive');
	});
	

	describe("start", function() {

		it("should start a job", function(done) {
			job.start(function(){
				done();
			});
			worker.start();
		});

		it('should be active', function() {
			worker.start();
			assert.equal(worker.state, 'active');
		});
		
	});
	
	
});
