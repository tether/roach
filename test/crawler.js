var roach = require('..');
var assert = require('assert');
var writable = require('stream').Writable;

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
    //this is wrong
    ws._write = function (chunk, enc, next) {
      next();
    };
  });

  it("should have a http handler", function(done) {
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

describe("Unzip", function() {
  
});
