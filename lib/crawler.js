var mixin = require('uberproto').mixin;
var request = require('request');
var read = require('fs').readFile;

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

function Crawler() {
  //do something
}


Crawler.http = function(url, fn) {
	request(url, fn);
};

Crawler.file = function(url, fn) {
	read(url, fn);
};

Crawler.get = function(url, fn) {
	if(/file:\/\/.*/.test(url)) return Crawler.file(url.substring(7), fn);
	Crawler.http(url, fn);
};


Crawler.unzip = function() {

};