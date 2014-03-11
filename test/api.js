var roach = require('..'),
assert = require('assert');

describe("API", function() {

	describe("server", function() {
		it("should expose a function constructor", function() {
			assert.equal(typeof roach, 'function');
		});

		it('should use jobs', function() {
			assert.equal(typeof roach().use, 'function');
		});
	});
	
	describe("job", function() {

		var job;
		beforeEach(function() {
			job = roach.bug();
		});
		
		it("should expose a function constructor to build jobs", function() {
			assert.equal(typeof roach.bug, 'function');	
		});

		it('should inherit from an emitter', function() {
			assert.equal(typeof job.on, 'function');
			assert.equal(typeof job.emit, 'function');
			assert.equal(typeof job.once, 'function');
			assert.equal(typeof job.off, 'function');
		});
		
	});
	
});
