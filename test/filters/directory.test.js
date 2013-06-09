var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    directory = require('../../lib/filters/directory.js');

describe("roach.test.filters.directory", function() {

  it("should return [] if not a directory", function() {
    // TEST
    var result = directory( path.resolve(process.cwd(), 'package.json') );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return [] if directory doesn't exist", function() {
    // TEST
    var result = directory( path.resolve(process.cwd(), 'foo') );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return all file paths for files in the directory when no selector is passed", function() {
    // SETUP
    var expected = [
      path.resolve(process.cwd(), 'transports', 'file.js'),
      path.resolve(process.cwd(), 'transports', 'logger.js'),
      path.resolve(process.cwd(), 'transports', 'mongodb.js'),
      path.resolve(process.cwd(), 'transports', 'rabbitmq.js'),
    ];

    // TEST
    var result = directory( path.resolve(process.cwd(), 'transports') );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return all file paths for files in the directory that match a given selector", function() {
    // SETUP
    var expected = [
      'package.json'
    ];

    var selector = '.json';

    // TEST
    var result = directory( path.resolve(process.cwd()), selector );

    // VERIFY
    expect(result).to.deep.equal(expected);
  });

});