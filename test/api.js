var roach = require('..');
var assert = require('assert');

// A word...
// ----------------
 
// All critical parts of roach are unit tested. All tests use only
// the library `assert` in order to be clean and readable.
// 
// Some tests are asynchronous (read/write redis) and use
// the asynchronous API of mocha (`done` callback).
// 
// A test prefixed by `#` describes a feature or behaviour.<br>
// A test prefixed by `.` describes a function/handler.

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
      job = roach.job();
    });
    
    it("should expose a function constructor to build jobs", function() {
      assert.equal(typeof roach.job, 'function');
    });

    it('should inherit from an emitter', function() {
      assert.equal(typeof job.on, 'function');
      assert.equal(typeof job.emit, 'function');
      assert.equal(typeof job.once, 'function');
      assert.equal(typeof job.off, 'function');
    });

    it('should expose config', function() {
      assert.equal(typeof job.config, 'function');
    });
    
  });
  
});
