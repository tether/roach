var roach = require('..'),
assert = require('assert');

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

	var crawler;
	beforeEach(function() {
		crawler = roach.crawler();
	});

	it("should have a http handler", function(done) {
		crawler.http('http://rawgithub.com/petrofeed/roach/master/README.md', function(err, res, body) {
			if(!err) done();
		});
	});

	it('should have a file handler', function(done) {
		crawler.file(__dirname + '/crawler.js', function(err) {
			if(!err) done();
		});
	});
	
	it("should get from http://", function(done) {
		crawler.get('http://rawgithub.com/petrofeed/roach/master/README.md', function(err) {
			if(!err) done();
		});
	});

	it('should get from file://', function(done) {
		crawler.get('file://' + __dirname + '/crawler.js', function(err) {
			if(!err) done();
		});
	});

});