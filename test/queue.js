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

describe("Push", function() {

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
      //is the task id
      if(typeof val === 'number') done();
    });
  });
  
});

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
      client.hgetall(Queue.key + ':' + id, function(err, res) {
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


// var client = redis.createClient();

// describe("Add job", function() {

//  var queue;
//  beforeEach(function() {
//    Queue.key = 'test:jobs';
//    queue = new Queue();
//  });

//  afterEach(function() {
//    client.lpop(Queue.key);
//    client.set(Queue.key + ':id', 0);
//  });
  
//  it("should add a job into the queue list", function(done) {

//    queue.add('test', function(err, r) {
//      client.lrange(Queue.key, 0, 0, function(err, res) {
//        if(res[0] === 'test') done();
//      });
//    });

//  });
  
//  it('should increment a job id key', function(done) {

//    queue.add('test');
//    queue.add('other', function() {
//      client.get(Queue.key + ':id', function(err, res) {
//        if(Number(res) === 2) done();
//      });
//    });

//  });

//  it("should send notif when job is added", function(done) {
//    queue.on('added', function() {
//      done();
//    });
//    queue.add('test');
//  });
  


// });
