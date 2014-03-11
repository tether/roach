var roach = require('..'),
assert = require('assert');

describe("API", function() {

	describe("server", function() {
		assert.equal(typeof roach, 'function');
	});
	
	describe("jobs", function() {
		assert.equal(typeof roach.bug, 'function');
	});
	
});
