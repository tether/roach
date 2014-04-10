var roach = require('..');
var assert = require('assert');

describe('job', function() {

	describe(".config(...)", function() {

		var job;
		beforeEach(function() {
			job = roach.job();
		});
		
		it('should set and get config', function() {
			job.config('type', 'web');
			assert.equal(job.config('type'), 'web');
		});

		it('should merge config', function() {
			job.config('type', 'web');
			job.config({
				type: 'ftp',
				name: 'get release notes'
			});

			assert.equal(job.config('type'), 'ftp');
			assert.equal(job.config('name'), 'get release notes');				
		});

		it('returns the config', function() {
			job.config({
				name: 'weather',
				type: 'http'
			});
			assert.deepEqual(job.config(), {
				name: 'weather',
				type: 'http'
			});
		});

		describe("# observable", function() {

			it('should listen for changes in config', function(done) {
				job.sandbox.on('change type', function() {
					done();
				});
				job.config('type', 'web');
			});

		});
		

	});

	describe(".progress(...)", function() {

		var job;
		beforeEach(function() {
			job = roach.job();
		});

		it("should have a progress handler", function() {
			assert.equal(typeof job.progress, 'function');
		});

		it('should emit progress message', function(done) {
			job.on('progress', function() {
				done();
			});
			job.progress();
		});

		it('should emit how complete it is', function(done) {
			job.on('progress', function(val) {
				if(val === 10) done();
			});
			job.progress(10);
		});

		it('should emit how complete it is relative to total', function(done) {
			job.on('progress', function(val) {
				if(val === 10) done();
			});
			job.progress(13, 120);
		});
		
	});

	describe(".log(...)", function() {
		
		var job;
		beforeEach(function() {
			job = roach.job();
		});

		it('should have a log handler', function() {
			assert.equal(typeof job.log, 'function');
		});


		it('should emit message log', function(done) {
			job.on('log', function(msg) {
				if(msg === 'test') done();
			});
			job.log('test');
		});

		it('should not emit a log event if message empty', function() {
			var called = false;
			job.on('log', function() {
				called = true;
			});
			job.log();
			assert.equal(called, false);
		});

		it('should have a sprintf style', function(done) {
			job.on('log', function(msg) {
				if(msg === 'test roach') done();
			});
			job.log('test %s', 'roach');
		});

		it('should have a array-like style', function(done) {
			job.on('log', function(msg) {
				if(msg === 'test jobs roach') done();
			});
			job.log('test %1 %0', 'roach', 'jobs');
		});

	});


	describe(".data(...)", function() {

		var job;
		beforeEach(function() {
			job = roach.job();
		});

		it("should queued data events", function(done) {
			job.data('other');
			job.on('_data', function(val) {
				if(val === 'other') done();
			});
		});

	});

	describe("# hooks", function() {
		
		var job;
		beforeEach(function() {
			job = roach.job();
		});

		describe("start", function() {
			
			it('should have a start handler', function() {
				assert.equal(typeof job.start, 'function');
			});

			it('should execute start on start command', function(done) {
				job.start(function() {
					done();
				});
				job.emit('start');
			});

		});

		describe('stop', function() {

			it('should have a stop handler', function() {
				assert.equal(typeof job.stop, 'function');
			});

			it('should emit a stop command', function(done) {
				job.on('stop', function() {
					done();
				});
				job.stop(); //hammer time
			});

		});
		
	});

});