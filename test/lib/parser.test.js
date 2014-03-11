var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai"),
    expect = chai.expect,
    Parser = require('../../lib/parser'),
    Event = require('events').EventEmitter;

chai.use(sinonChai);

describe("roach.test.lib.parser", function() {

  describe("applyFilters", function() {
    var obj = null,
        emitter = null,
        parser = null,
        document = null;

    beforeEach(function(){
      document = '         we are awesome      ha ha        ';
      emitter = new Event();
      parser = new Parser();
      parser.setDocument(document);

      obj = {
        trim : function (document, emitter){
          return document.trim();
        },
        split : function (document, emitter){
          return document.split(' ');
        }
      };

      sinon.spy(obj, 'trim');
      sinon.spy(obj, 'split');
    });

    afterEach(function(){
      document = null;
      emitter = null;
      parser = null;
    });

    it("should properly apply a single filter", function(done){
      
      // SETUP
      parser.addFilter(obj.trim);
      var expected = document.trim();

      // TEST
      var result = parser.applyFilters();

      // VERIFY
      expect(obj.trim).to.have.been.calledOnce;
      expect(result).to.equal(expected);

      done();
    });

    it("should properly apply multiple filters", function(done){
      
      // SETUP
      parser.addFilter(obj.trim);
      parser.addFilter(obj.split);
      
      var expected = document.trim().split(' ');

      // TEST
      var result = parser.applyFilters();

      // VERIFY
      expect(obj.trim).to.have.been.calledOnce;
      expect(obj.split).to.have.been.calledOnce;
      expect(result).to.deep.equal(expected);

      done();
    });

    it("should emit an event");

  });

  describe('eventFilters', function(){

    var obj = null,
        parser = null,
        document = null;

    beforeEach(function(){

      document = '         we are awesome      ha ha        ';

      parser = new Parser();

      parser.setDocument(document);

      obj = {
        trim : function (document, emitter){
          console.log('INSIDE TRIM', document, emitter);
          return document.trim();
        },
        split : function (document, emitter){
          return document.split(' ');
        }
      };

      sinon.spy(obj, 'trim');
      sinon.spy(obj, 'split');
    });

    afterEach(function(){
      document = null;
      parser = null;
    });

    it('should pass an event emitter to each filter', function(){

      //SETUP
      var spy = sinon.spy();


      parser.on('parsed', spy);

      parser.addFilter(function(doc, options, emitter) {

        emitter.emit('parsed');

        return doc;

      });

      parser.applyFilters();

      // VERIFY
      expect(spy).to.have.been.called;

    });

  });

});