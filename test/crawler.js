var roach = require('..');
var assert = require('assert');
var stream = require('stream');
var readable = require('fs').createReadStream;
var writable = stream.Writable;
var transformable = stream.Transform;

describe("Mixin", function() {

  it("should mixin object", function() {
    var crawler = roach.crawler({
      custom:function() {

      }
    });
    assert(crawler.custom);
  });

});

describe("Get file", function() {

  var crawler, ws;
  beforeEach(function() {
    crawler = roach.crawler();
    ws = writable();
    //to force end/finish
    ws._write = function (chunk, enc, next) {
      next();
    };
  });

  it("should have a http handler", function(done) {
    //can not be piped
    crawler.http('http://rawgithub.com/petrofeed/roach/master/README.md', function(err, res, body) {
      if(!err) done();
    });
  });

  it('should have a file handler', function(done) {
    ws.on('finish', done);
    crawler.file(__dirname + '/crawler.js').pipe(ws);
  });
  
  it("should get from http://", function(done) {
    ws.on('finish', done);
    crawler.get('http://rawgithub.com/petrofeed/roach/master/README.md').pipe(ws);
  });

  it('should get from file://', function(done) {
    ws.on('finish', done);
    crawler.get('file://' + __dirname + '/crawler.js').pipe(ws);
  });

  it('should get from constructor', function(done) {
    ws.on('finish', done);
    crawler('file://' + __dirname + '/crawler.js').pipe(ws);
  });

});

describe("CSV", function() {

  var crawler;
  beforeEach(function() {
    crawler = roach.crawler();
  });

  it("should read and parse csv file", function(done) {
    crawler('file://' + __dirname + '/fixtures/roach.csv')
      .pipe(crawler.csv({objectMode:true}, function(err, doc) {
        if(!err) done();
      }));
  });
  
});


describe("HTML", function() {

  var crawler;
  beforeEach(function() {
    crawler = roach.crawler();
  });

  it("should read and parse html file", function(done) {
    var ws = writable({objectMode:true});
    ws._write = function(chunk, enc, cb) {
      var result = chunk.toString();
      if(result === 'this is a footer') done();
      cb();
    };
    crawler('file://' + __dirname + '/fixtures/roach.html')
      .pipe(crawler.html(function() {
        this.select('footer')
          .createReadStream()
          .pipe(ws);
      }));
  });
  
});


describe("XML", function() {
  var crawler;
  beforeEach(function() {
    crawler = roach.crawler();
  });

  it("should read and parse xml file", function(done) {
    var ws = writable({objectMode:true});
    ws._write = function(chunk, enc, cb) {
      var result = chunk.toString();
      if(result === 'Empire Burlesque') done();
      cb();
    };
    crawler('file://' + __dirname + '/fixtures/roach.xml')
      .pipe(crawler.xml(function() {
        this.select('item title')
          .createReadStream()
          .pipe(ws);
      }));
  });
});

describe("Event stream", function() {

  var crawler;
  beforeEach(function() {
    crawler = roach.crawler();
  });

  it("should inherit from event-stream", function() {
    assert(crawler.split);
    assert(crawler.pipeline);
    assert(crawler.map);
    assert(crawler.through);
    assert(crawler.mapSync);
    assert(crawler.join);
    assert(crawler.merge);
    assert(crawler.replace);
    assert(crawler.parse);
    assert(crawler.stringify);
    //...
  });
  
});


// describe("Unzip", function() {

//   var crawler, ws;
//   beforeEach(function() {
//     crawler = roach.crawler();
//     ws = transformable();
//     //this is wrong
//     ws._transform = function (chunk, enc, done) {
//       console.log('hihi',chunk);
//       done();
//     };
//   });

//   it('should unzip archive', function(done) {

//     crawler('file://' + __dirname + '/test.zip')
//       .pipe(crawler.unzip())
//       .on('data', function() {
//         console.log('data');
//       });
//   });

// });
