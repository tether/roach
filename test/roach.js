var roach = require('..');
var assert = require('assert');
var client = require('redis').createClient();

describe('roach', function() {

	describe("# start job", function() {

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

	describe("# accepts function as job", function() {
		
		var master;
		beforeEach(function() {
			master = roach();
		});

		it('should pass a job to the function', function(done) {
			master.use('something', function(job) {
				job.start(function() {
					done();
				});
			});
			master.add('something');
		});

	});


	describe("# queue pending job", function() {

		var master, job;
		beforeEach(function() {
			master = roach();
			job = roach.job();
		});

		it("should have an add handler", function() {
			assert.equal(typeof master.add, 'function');
		});

		// Roach uses [emitter-queue](http://github.com/bredele/emitter-queue)
    // in order to run a job asynchronously. Messages and events are never
    // lost.

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


	describe('# queue active job', function() {

		var master, job;
		beforeEach(function() {
			master = roach();
			job = roach.job();
		});

		it('should add job id in active job when started', function(done) {
			job.start(function(id) {
				// we test if the job is in the active queue
				client.zrank('roach:jobs:active', id, function(err, res) {
					if(res) done();
				});
			});
			master.use('video', job);
			master.add('video');
		});

	});

});

