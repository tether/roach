var utils = require('../../utils'),
    assert = require('assert');

describe("Mixin", function() {
  it("should have a mixin handler", function() {
    assert.equal(typeof utils.mixin, 'function'); 
  });

  it('should mixin two objects', function() {
    var to = {
      name: 'roach'
    };
    utils.mixin(to, {
      type: 'github'
    });
    assert.deepEqual(to, {
      name: 'roach',
      type: 'github'
    });
  });
  
});

describe("Clone", function() {
  it("should have a clone handler", function() {
    assert.equal(typeof utils.clone, 'function');    
  });
  
});


describe("Node utils", function() {
  
  it("format", function() {
    assert.equal(typeof utils.format, 'function');
  });

  //NOTE: refactor to have something like debug('name')('message');
  it("debug", function() {
    assert.equal(typeof utils.debug, 'function');
  });

  it("error", function() {
    assert.equal(typeof utils.error, 'function');
  });

  it("log", function() {
    assert.equal(typeof utils.log, 'function');
  });

  it("inspect", function() {
    assert.equal(typeof utils.inspect, 'function');
  });

  it("isArray", function() {
    assert.equal(typeof utils.isArray, 'function');
  });

  it("inherits", function() {
    assert.equal(typeof utils.inherits, 'function');
  });

});
