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
	
	describe("jobs", function() {
		it("should expose a function constructor to build jobs", function() {
			assert.equal(typeof roach.bug, 'function');	
		});
		
	});
	
});
