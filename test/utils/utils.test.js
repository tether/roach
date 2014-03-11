var chai = require('chai');
var expect = chai.expect;
var utils = require('../../utils/index.js');

describe("roach.test.utils.index", function() {

  describe("getRandomUserAgent", function() {
    it("should return a user agent string", function(){
      // SETUP

      // TEST
      var result = utils.getRandomUserAgent();

      // VERIFY
      expect(result).to.not.be.null;
    });
  });

  describe('isURI', function() {

    it('should return true for an http url', function() {

      // TEST
      var result = utils.isURI('http://google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an https url', function() {

      // TEST
      var result = utils.isURI('https://foo.google.io');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an ftp url', function() {

      // TEST
      var result = utils.isURI('ftp://user:pass@www.google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return false for non url string', function() {

      // TEST
      var result = utils.isURI('/home/users/tmp/');

      // VERIFY
      expect(result).to.be.false;

    });

  });

  describe("isZipFile", function() {

    it("should return true when filename contains '.zip'", function(){
      // SETUP
      var filename = 'foo.zip';

      // TEST
      var result = utils.isZipFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return true when filename contains '.ZIP'", function(){
      // SETUP
      var filename = 'foo.ZIP';

      // TEST
      var result = utils.isZipFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return false when filename doesn't contain '.zip' or '.ZIP'", function(){
      // SETUP
      var filename = 'foobar';

      // TEST
      var result = utils.isZipFile(filename);

      // VERIFY
      expect(result).to.be.false;
    });
  });

  describe("isExcelFile", function() {

    it("should return true when filename contains '.xls'", function(){
      // SETUP
      var filename = 'foo.xls';

      // TEST
      var result = utils.isExcelFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return true when filename contains '.XlsX'", function(){
      // SETUP
      var filename = 'foo.XlsX';

      // TEST
      var result = utils.isExcelFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return false when filename doesn't contain '.xls' or '.XLSX'", function(){
      // SETUP
      var filename = 'foobar';

      // TEST
      var result = utils.isExcelFile(filename);

      // VERIFY
      expect(result).to.be.false;
    });
  });
});