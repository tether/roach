var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai"),
    expect = chai.expect,
    Proxy = require('../../lib/proxy'),
    Event = require('events').EventEmitter;

chai.use(sinonChai);

describe("roach.test.lib.proxy", function() {

  describe("fetch", function() {

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