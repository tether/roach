var chai = require('chai');
var expect = chai.expect;
var request = require('../../utils/request.js');

describe("roach.test.utils.request", function() {
  describe("getRandomUserAgent", function() {
    it("should return a user agent string", function(){
      // SETUP

      // TEST
      var result = request.getRandomUserAgent();

      // VERIFY
      expect(result).to.not.be.null;
    });
  });
});