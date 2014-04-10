
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
 * Expose 'Crawler'.
 * A crawler is a mixin of event-stream and
 * an optional object.
 * example:
 *
 *   var crawler = require('crawler')(obj);
 *   //or
 *   roach.crawler(obj);
 *
 * @return {Crawler}
 * 
 * @see https://github.com/dominictarr/event-stream
 */

module.exports = function(obj) {
	mixin(obj, Crawler);
	return Crawler;
};


/**
 * Crawler constructor.
 * A crawler is an API of pipable handlers.
 * example:
 *
 *    crawler('http://remote.org/file').pipe();
 *    crawler('file://local/file').pipe();
 * 
 * @api public
 */

function Crawler(url) {
  return Crawler.get(url);
}


//mixin with event stream

mixin(stream, Crawler);


/**
 * Create read stream from http request.
 * example:
 *
 *   crawler.http('http://url.org', cb);
 *   
 * @param  {String} url (prefixed by http://)
 * @return {Stream}
 * 
 * @see  https://github.com/mikeal/request
 * @api private
 */

Crawler.http = function(url, fn) {
	return request(url, fn);
};


/**
 * Create read stream from local file. 
 * example:
 *
 *   crawler.file('file://home/myfile');
 *   
 * @param  {String} url (prefixed by file://)
 * @return {Stream}
 * 
 * @api private
 */

Crawler.file = function(url) {
	return read(url);
};


/**
 * Readable file stream. 
 * A file stream can be either a local or remote (http) file.
 * 
 * @param  {String} url (prefixed by file:// or http://)
 * @return {Stream}
 * 
 * @api public
 */

Crawler.get = function(url) {
	if(/file:\/\/.*/.test(url)) return Crawler.file(url.substring(7));
	return Crawler.http(url);
};


/**
 * CSV stream parser.
 * example:
 *
 *   stream.pipe(crawler.csv());
 *
 * @param  {Object} options
 * @return {Function}  cb
 * @return {Stream}
 * 
 * @see https://github.com/klaemo/csv-stream
 * @api public
 */

Crawler.csv = function(options, cb) {
	return csv(options, cb);
};


/**
 * HTML stream parser with
 * query selector engine.
 * example:
 *
 *   stream.pipe(crawler.html(function() {
 *     this.select('li.item');
 *   }));
 *   
 * @param  {Function} cb
 * @return {Stream}
 * 
 * @see https://github.com/substack/node-trumpet
 * @api public
 */

Crawler.html = function(cb) {
	var tr = trumpet();
	cb && cb.call(tr);
	return tr;
};


/**
 * XML stream parser with
 * query selector engine.
 * example:
 *
 *   stream.pipe(crawler.xml(function() {
 *     this.select('items');
 *   }));
 *   
 * @param  {Function} cb
 * @return {Stream}
 * 
 * @see https://github.com/substack/node-trumpet
 * @api public
 */

Crawler.xml = function(cb) {
	return Crawler.html(cb);
};


/**
 * Unzip stream and parse
 * entries.
 * example:
 *
 *   stream.pipe(crawler.unzip());
 *   
 * @param  {string} dir optional
 * @return {Stream}
 * @see https://github.com/EvanOxfeld/node-unzip
 * @api public
 */

Crawler.unzip = function(dir) {
	if(dir) return unzip.Extract({path: dir});
	return unzip.Parse();
};


/**
 * Parse XLS files.
 * example:
 *
 *   stream.pipe(crawler.xls());
 *   
 * @return {Stream}
 * 
 * @see https://github.com/SheetJS/js-xls
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
 * example:
 *
 *   stream.pipe(crawler.xlsx());
 *   
 * @return {Stream}
 * 
 * @see https://github.com/SheetJS/js-xlsx
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
 * 
 * @api public
 */

Crawler.end = function(cb) {
	return this.through(null, cb);
};


// Crawler.step = function(name) {
// 	var step = name;
// 	if(typeof step === 'string') {
// 		step = require(resolve('.', name));
// 	}
// 	step();
// };