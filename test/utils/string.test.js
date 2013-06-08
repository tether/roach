var chai = require('chai');
var expect = chai.expect;
var str = require('../../utils/string.js');

describe("roach.test.utils.string", function() {
  describe("camelize", function() {
    it("should camelCase a space separated string", function(){
      // SETUP
      var string = 'foo bar';

      // TEST
      var result = str.camelize(string);

      // VERIFY
      expect(result).to.equal('fooBar');
    });

    it("should camelCase a dash separated string", function(){
      // SETUP
      var string = 'foo-BaR-baz';

      // TEST
      var result = str.camelize(string);

      // VERIFY
      expect(result).to.equal('fooBarBaz');
    });

    it("should camelCase an underscore separated string", function(){
      // SETUP
      var string = 'Foo_bar_baz';

      // TEST
      var result = str.camelize(string);

      // VERIFY
      expect(result).to.equal('fooBarBaz');
    });
  });
});