
/**
 * Module dependencies.
 * @api private
 */

var mixin = require('uberproto').mixin;
var request = require('request');
var read = require('fs').createReadStream;
var unzip = require('unzip');
var csv = require('csv-streamify');
var trumpet = require('trumpet');


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


/**
 * Readable remove file stream. 
 * 
 * @param  {String} url (prefixed by http://)
 * @stream-type {Readable}
 * @api private
 */

Crawler.http = function(url, fn) {
	return request(url, fn);
};


/**
 * Readable local file stream. 
 * 
 * @param  {String} url (prefixed by file://)
 * @stream-type {Readable}
 * @api private
 */

Crawler.file = function(url) {
	return read(url);
};


/**
 * Readable file stream. A file stream can be
 * either a local or remote (http) file.
 * 
 * @param  {String} url (prefixed by file:// or http://)
 * @stream-type {Readable}
 * @api public
 */

Crawler.get = function(url) {
	if(/file:\/\/.*/.test(url)) return Crawler.file(url.substring(7));
	return Crawler.http(url);
};


/**
 * CSV stream parser.
 * 
 * @param  {Object} options
 * @return {Function}  cb
 * @stream-type {Transform}
 * @api public
 */

Crawler.csv = function(options, cb) {
	return csv(options, cb);
};


/**
 * HTML stream parser.
 *
 * @param  {Function} cb
 * @atream-type {Transform}
 * @api public
 */

Crawler.html = function(cb) {
	var tr = trumpet();
	cb && cb.call(tr);
	return tr;
};


/**
 * XML stream parser.
 *
 * @param  {Function} cb
 * @atream-type {Transform}
 * @api public
 */

Crawler.xml = function(cb) {
	return Crawler.html(cb);
};

// Crawler.unzip = function(dir) {
// 	if(dir) return unzip.Extract({path: dir});
// 	return unzip.Parse();
// };