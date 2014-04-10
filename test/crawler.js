var roach = require('..');
var assert = require('assert');
var stream = require('stream');
var writable = stream.Writable;


describe('crawler', function() {

  describe("# mixin", function() {

    it("should mixin object", function() {
      var crawler = roach.crawler({
        custom:function() {

        }
      });
      assert(crawler.custom);
    });

  });


  describe(".get(...)", function() {

    var crawler, ws;
    beforeEach(function() {
      crawler = roach.crawler();
      //All the crawler's handlers return a stream
      //and we need to pipe it in order to test the
      //result output.
      //
      //`_write` is part of the new stream API of nodejs.
      ws = writable();
      ws._write = function (chunk, enc, next) {
        //will call the `done` callback.
        next();
      };
    });

    it("should have a http handler", function(done) {
      crawler.http('http://rawgithub.com/petrofeed/roach/master/README.md', function(err, res, body) {
        done(err);
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

  describe(".csv(...)", function() {

    var crawler;
    beforeEach(function() {
      crawler = roach.crawler();
    });

    it("should read and parse csv file", function(done) {
      // It returns a JSON document if `objectMode` option
      // is specified.
      crawler('file://' + __dirname + '/fixtures/roach.csv')
        .pipe(crawler.csv({
          objectMode: true
        }, function(err, doc) {
          if(!err) done();
        }));
    });
    
  });


  describe(".html(...)", function() {

    var crawler;
    beforeEach(function() {
      crawler = roach.crawler();
    });

    it("should read and parse html file", function(done) {
      var ws = writable({
        objectMode: true
      });
      ws._write = function(chunk, enc, cb) {
        var result = chunk.toString();
        if(result === 'this is a footer') done();
        cb();
      };
      crawler('file://' + __dirname + '/fixtures/roach.html')
        .pipe(crawler.html(function() {
          // The callback allows you to select fragment of
          // the html document, get attributes and more.
          // see [trumpet](https://github.com/substack/node-trumpet) for more details.
          this.select('footer')
            .createReadStream()
            .pipe(ws);
        }));
    });
    
  });


  describe(".xml(...)", function() {
    var crawler;
    beforeEach(function() {
      crawler = roach.crawler();
    });

    it("should read and parse xml file", function(done) {
      var ws = writable({
        objectMode: true
      });
      ws._write = function(chunk, enc, cb) {
        var result = chunk.toString();
        if(result === 'Empire Burlesque') done();
        cb();
      };
      // the API for xml is the same as html.
      crawler('file://' + __dirname + '/fixtures/roach.xml')
        .pipe(crawler.xml(function() {
          this.select('item title')
            .createReadStream()
            .pipe(ws);
        }));
    });
  });

  describe("# event stream", function() {

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

    it('should do a lot of stuff', function(done) {
      // see [event-stream](https://github.com/dominictarr/event-stream)
      // for more details.
      crawler('file://' + __dirname + '/fixtures/roach.text')
        .pipe(crawler.split())
        .pipe(crawler.mapSync(function(data) {
          return data.toUpperCase();
        }))
        .pipe(crawler.join(' '))
        .pipe(crawler.wait())
        .on('data', function(data) {
          if(data === 'ERIC ASHLEY MARK AMIT') done();
        });
    });
    
  });


  describe(".unzip(...)", function() {

    var crawler;
    beforeEach(function() {
      crawler = roach.crawler();
    });

    it('should unzip archive', function(done) {
      // `unzip` accept options in order to extract
      // the zip archive instead parsing it.
      // see [node-unzip](https://github.com/EvanOxfeld/node-unzip)
      crawler('file://' + __dirname + '/fixtures/test.zip')
        .pipe(crawler.unzip())
        .on('entry', function(entry) {
          entry.pipe(crawler.through(function(data) {
            if(data.toString() === 'hello') done();
          }));
        });
    });

  });

  //see [xlsjs](https://github.com/SheetJS/js-xlsx) for more details.
  describe('.xls(...)', function() {
    var crawler;
    beforeEach(function() {
      crawler = roach.crawler();
    });

    it('should parse xls', function(done) {
      crawler('file://' + __dirname + '/fixtures/roach.xls')
        .pipe(crawler.xls())
        .pipe(crawler.through(function(data) {
          done();
        }));
    });

    it('should parse xlsx', function(done) {
      crawler('file://' + __dirname + '/fixtures/roach.xlsx')
        .pipe(crawler.xlsx())
        .pipe(crawler.through(function(data) {
          done();
        }))
    });
  });

});
