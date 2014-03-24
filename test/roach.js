var roach = require('..'),
assert = require('assert');

describe("start job (debug purpose)", function() {

	var master, job;
	beforeEach(function() {
		master = roach();
		job = roach.job();
	});
	
	it('should start job', function(done) {
		job.start(function(){
			done();
		});
		master.use(job);
	});
});

describe("queue job", function() {

	var master, job;
	beforeEach(function() {
		master = roach();
		job = roach.job();
	});

	it("should have an add handler", function() {
		assert.equal(typeof master.add, 'function');
	});

	it('should start job if added', function(done) {
		job.start(function() {
			done();
		});
		master.add('traffic');
		master.use('traffic', job);
	});

	it('should start job on add', function(done) {
		job.start(function() {
			done();
		});
		master.use('weather', job);
		master.add('weather');
	});
	
});

