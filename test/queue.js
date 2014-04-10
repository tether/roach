var Queue = require('../lib/queue');
var assert = require('assert');
var redis = require('redis');

var client = redis.createClient();

describe('queue', function() {

  describe(".add(...)", function() {

    var queue;
    beforeEach(function() {
      queue = new Queue();
    });

    // `queue` is based on [emitter-queue](http://github.com/bredele/emitter-queue)
    // in order to run a job asynchronously. 
    // 
    // An event `added` is queued once a job has been 
    // added into the pending queue. It means you can subscribe to this
    // event after it has been fired and the callback will still be executed.
    it("should queue events", function(done) {
      queue.add('event');
      queue.on('added event', function(val) {
        done();
      });
    });
    
  });


  // `push` is a **private** function which increment
  // the job id into redis and push task into the
  // pending queue.
  describe(".push(...)", function() {

    var queue;
    beforeEach(function() {
      queue = new Queue();
    });

    it("should have a push handler", function() {
      assert(queue.push);
    });

    it("should push new job id into the queue", function(done) {
      queue.push('weather', {
        type: 'haha'
      }).then(function(val) {
        if(typeof val === 'number') done();
      });
    });
    
  });

  // `create` is a **private** function which 
  // creates a redis hash field with passed options.
  describe(".create(...)", function() {

    var queue;
    beforeEach(function() {
      queue = new Queue();
    });

    it("should have a create handler", function() {
      assert(queue.create);
    });

    it("should create a hashkey for the task", function(done) {
      queue.once('added', function(name, id, options) {
        client.hgetall('roach:jobs:' + id, function(err, res) {
          if(!err) done();
        });
      });

      queue.add('weather', {
        city: 'calgary',
        time: 'morning'
      });
    });
    
  });

  // `get` is a **private** function which 
  // get all the stored hash keys for a given
  // job id.
  describe(".get(...)", function() {

    var queue;
    beforeEach(function(){
      queue = new Queue();
    });

    it("should have a get handler", function() {
      assert(queue.get);
    });

    it("sould return a promise with the job hashkey as value", function(done) {
      queue.on('added', function(name, id) {
        queue.get(id).then(function(value) {
          // the job's type (or name) is merged
          // with the options into the hash field.
          done(assert.deepEqual(value, {
            name: 'stock',
            currency: 'dollars',
            company: 'apple'
          }));
        });
      });

      queue.add('stock', {
        currency: 'dollars',
        company: 'apple'
      });
    });
    
    
  });

  // removes job from active queue. It also
  // try to remove a job from pending queue
  // just to be sure there is no 'garbage'.
  describe(".remove(...)", function() {
    var queue;
    beforeEach(function(){
      queue = new Queue();
    });

    it("should have a remove handler", function() {
      assert(queue.remove);
    });

    it("should remove job in queue", function(done) {
      // all queues in roach are sorted because we
      // need to get the index of a specifid job into a queue (remove).
      client.zrange('roach:jobs:pending', 0, 0, function(err, ids) {
        queue.remove(ids[0], function(err) {
          if(!err) done();
        });
      });
    });
    
  });

});