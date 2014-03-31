var Queue = require('../lib/queue'),
    assert = require('assert'),
    redis = require('redis');

var client = redis.createClient();


describe("Local", function() {

  describe("Add", function() {

    var queue;
    beforeEach(function() {
      queue = new Queue();
    });

    it("should queue events", function(done) {
      queue.add('event');
      queue.on('added event', function(val) {
        done();
      });
    });
    
  });
  
});

//Comment to test init
// describe("Push", function() {

//   var queue;
//   beforeEach(function() {
//     queue = new Queue();
//   });

//   it("should have a push handler", function() {
//     assert(queue.push);
//   });

//   it("should push new job id into the queue", function(done) {
//     queue.push('weather', {
//       type: 'haha'
//     }).then(function(val) {
//       //is the task id
//       if(typeof val === 'number') done();
//     });
//   });
  
// });

describe("Create", function() {

  var queue;
  beforeEach(function() {
    queue = new Queue();
  });

  it("should have a create handler", function() {
    assert(queue.create);
  });

  it("should create a hashkey for the task", function(done) {

    queue.on('added', function(name, id, options) {
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

describe("Get", function() {

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

describe("Remove", function() {
  var queue;
  beforeEach(function(){
    queue = new Queue();
  });

  it("should have a remove handler", function() {
    assert(queue.remove);
  });

  it("should remove job in queue", function(done) {
    client.lrange('roach:jobs', 0, 0, function(err, ids) {
      queue.remove(ids[0], function(err) {
        if(!err) done();
      });
    });

  });
  
});


// describe("Init", function() {

//   it("should add jobs into the queue on init", function() {
//     var queue, arr;
//     client.lrange('roach:jobs', 0, -1, function(err, res) {
//       arr = res;
//       queue = new Queue();
//       queue.on('added', function(name, id, options) {
//         console.log(name, id, options);
//       });
//     });
//   });
  
// });


