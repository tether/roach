var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai"),
    expect = chai.expect,
    Proxy = require('../../lib/proxy'),
    Event = require('events').EventEmitter;

chai.use(sinonChai);

describe("roach.test.lib.proxy", function() {

  describe('constructor', function() {

    it('should mixin defaults properly when options are passed', function() {

      // SETUP
      var expected = {
        url: 'http://google.com',
        headers: {
          'User-Agent': 'foo'
        }
      };

      // TEST
      var proxy = new Proxy('http://google.com', { headers: {'User-Agent': 'foo'} });

      // VERIFY
      expect(proxy.options).to.deep.equal(expected);

    });

  });

  describe('isURI', function() {

    var proxy;

    before(function() {

      proxy = new Proxy();
    });

    it('should return true for an http url', function() {

      // TEST
      var result = proxy.isURI('http://google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an https url', function() {

      // TEST
      var result = proxy.isURI('https://foo.google.io');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an ftp url', function() {

      // TEST
      var result = proxy.isURI('ftp://user:pass@www.google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return false for non url string', function() {

      // TEST
      var result = proxy.isURI('/home/users/tmp/');

      // VERIFY
      expect(result).to.be.false;

    });

  });

  describe("fetch", function() {

    it("should call _visit if url is a URI");

    it("should call _readFile if url is not a URI");

  });

  describe("_visit", function() {

    it("should return a single document as a string", function(done){

      // SETUP
      var proxy = new Proxy("http://google.com");

      // TEST
      proxy.fetch(function(error, document){

        // VERIFY
        expect(error).to.be.null;
        expect(document).to.be.a.string;

        done();
      });
    });

    it("should return an error when status code !== 200 ", function(done){

      // SETUP
      var proxy = new Proxy("http://google.com/ahfsdhf");

      proxy.fetch(function(error, document){

        // VERIFY
        expect(error).to.not.be.null;
        expect(document).to.be.undefined;

        done();
      });
    });

  });

});