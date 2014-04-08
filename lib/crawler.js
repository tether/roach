
/**
 * Module dependencies.
 * @api private
 */

var mixin = require('uberproto').mixin;
var stream = require('event-stream');
var resolve = require('path').resolve;
var request = require('request');
var read = require('fs').createReadStream;
var unzip = require('unzip');
var csv = require('csv-streamify');
var trumpet = require('trumpet');
var xls = require('xlsjs');
var xlsx = require('xlsx');

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


//mixin with event stream

mixin(stream, Crawler);


// Crawler.step = function(name) {
// 	var step = name;
// 	if(typeof step === 'string') {
// 		step = require(resolve('.', name));
// 	}
// 	step();
// };


/**
 * Readable remove file stream. 
 * 
 * @param  {String} url (prefixed by http://)
 * @return {Stream}
 * @api private
 */

Crawler.http = function(url, fn) {
	return request(url, fn);
};


/**
 * Readable local file stream. 
 * 
 * @param  {String} url (prefixed by file://)
 * @return {Stream}
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
 * @return {Stream}
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
 * @return {Stream}
 * @api public
 */

Crawler.csv = function(options, cb) {
	return csv(options, cb);
};


/**
 * HTML stream parser.
 *
 * @param  {Function} cb
 * @return {Stream}
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
 * @return {Stream}
 * @api public
 */

Crawler.xml = function(cb) {
	return Crawler.html(cb);
};


/**
 * Unzip stream.
 * 
 * @param  {string} dir optional
 * @return {Stream}
 * @api public
 */

Crawler.unzip = function(dir) {
	if(dir) return unzip.Extract({path: dir});
	return unzip.Parse();
};


/**
 * Parse XLS files.
 * 
 * @return {Stream}
 * @api public
 */

Crawler.xls = function() {
	return this.through(function(data) {
		this.emit('data', xls.read(data.toString('binary'), {
			type:'binary'
		}));
	});
};


/**
 * Parse XLSX files.
 * 
 * @return {Stream}
 * @api public
 */


Crawler.xlsx = function() {
	return this.through(function(data) {
		this.emit('data', xlsx.read(data.toString('binary'), {
			type:'binary'
		}));
	});
};


/**
 * Catch stream end events.
 * example:
 *
 *   .pipe(crawler.end(cb))
 *   
 * @param  {Function} cb 
 * @return {Stream}
 * @api public
 */

Crawler.end = function(cb) {
	return this.through(null, cb);
};