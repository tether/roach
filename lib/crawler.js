var mixin = require('uberproto').mixin;
var request = require('request');
var read = require('fs').createReadStream;

/**
 * Expose 'Crawler'
 */

module.exports = function(obj) {
	mixin(obj, Crawler);
	return Crawler;
};


/**
 * Crawler constructor.
 * @api public
 */

function Crawler(url) {
  return Crawler.get(url);
}


Crawler.http = function(url, fn) {
	return request(url, fn);
};

Crawler.file = function(url) {
	return read(url);
};

Crawler.get = function(url) {
	if(/file:\/\/.*/.test(url)) return Crawler.file(url.substring(7));
	return Crawler.http(url);
};


Crawler.unzip = function() {

};