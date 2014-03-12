var roach = require('..'),
assert = require('assert');

describe("Config", function() {

	var job;
	beforeEach(function() {
		job = roach.bug();
	});
	
	it('should set and get config', function() {
		job.config('type', 'web');
		assert.equal(job.config('type'), 'web');
	});

	it('should mixin config', function() {
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

	// it('should mixin with roach.json', function() {
	// 	assert.equal(job.config('name'), 'weather');
	// 	assert.equal(job.config('description'), 'get weather');
	// });

	describe("Observable sandbox", function() {
		it('should listen for changes in config', function(done) {
			job.sandbox.on('change type', function() {
				done();
			});
			job.config('type', 'web');
		});
	});
	

});


describe("Life cycle", function() {
	
	var job;
	beforeEach(function() {
		job = roach.bug();
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
