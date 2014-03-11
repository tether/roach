var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    links = require('../../lib/filters/links.js');

describe("roach.test.filters.links", function() {

  it("should return [] if no links match the selector", function() {
    // SETUP
    var emptyDoc = '<html><head></head><body></body></html>';
    var selector = 'a[href*="foo.html"]';

    // TEST
    var result = links( emptyDoc, selector );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return links if links do match the selector", function() {
    // SETUP
    var linksDoc = '<html><head></head><body><a href="http://abc.com/foo.html">Foo1</a><a href="http://blah.com/foo.html">Foo2</a></body></html>';
    var selector = 'a[href*="foo.html"]';

    // TEST
    var result = links( linksDoc, selector );

    // VERIFY
    expect(result).to.deep.equal(['http://abc.com/foo.html', 'http://blah.com/foo.html']);
  });

  it("should return [] if no selector is undefined or null");
});