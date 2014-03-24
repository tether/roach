var roach = require('..'),
Adapter = require('../lib/adapter'),
assert = require('assert');

describe("Adapter", function() {

	var adapter, job, client;
	beforeEach(function() {
		job = roach.job();
		adapter = new Adapter(job);
		client = adapter.client;
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
		assert.equal(adapter.job, job);
	});

	it('should be inactive by default', function() {
		assert.equal(adapter.state, 'inactive');
	});
	

	describe("start", function() {

		it("should start a job", function(done) {
			job.start(function(){
				done();
			});
			adapter.start();
		});

		it('should be active', function() {
			adapter.start();
			assert.equal(adapter.state, 'active');
		});
		
	});
	
	
});
