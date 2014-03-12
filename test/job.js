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

	it('should mixin with roach.json', function() {
		assert.equal(job.config('name'), 'weather');
		assert.equal(job.config('description'), 'get weather');
	});

	describe("Observable sandbox", function() {
		it('should listen for changes in config', function(done) {
			job.sandbox.on('change type', function() {
				done();
			});
			job.config('type', 'web');
		});
	});
	

});
