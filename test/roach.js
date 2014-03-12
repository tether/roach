var roach = require('..'),
assert = require('assert');

describe("start job", function() {
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
