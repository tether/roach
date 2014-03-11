var Utils = {};

Utils.date = require('./date');
var _ = Utils._ = require('lodash');
Utils.str = Utils._.str = require('./string');
Utils.$ = require('cheerio');

// Mix in non-conflict functions to Utils._ namespace
Utils._.mixin(Utils._.str.exports());

// All functions, include conflict, will be available through _.str object
Utils._.str.include('Underscore.string', 'string'); // => true

/**
 * Returns a random user agent from a predefined list of agent strings
 *
 * @return {string} user agent
 * @api public
 */
Utils.getRandomUserAgent = function(){
  var userAgents = {
    ie9: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
    ie8: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
    ie7: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:19.0) Gecko/20100101 Firefox/19.0',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22',
    operaMac: 'Opera/9.80 (Macintosh; Intel Mac OS X 10.8.2) Presto/2.12.388 Version/12.14',
    firefoxWin: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11',
    operaWin: 'Opera/9.25 (Windows NT 5.1; U; en)',
    firefoxLinux: 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12'
  };

  var agents = _.values(userAgents);
  var index = Math.floor(Math.random() * agents.length);

  return agents[index];
};

/**
 * Checks if string is a URI
 *
 * Regex pulled from http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url.
 *
 * @param {string} uri
 * @return {boolean}
 * @api public
 */
Utils.isURI = function( uri ) {
  var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

  return regex.test(uri);
};


/**
 * Checks if filename is a zip file
 *
 * @param {string} filename
 * @return {boolean}
 * @api public
 */
Utils.isZipFile = function(filename){
  var regex = /\.zip/i;
  return regex.test(filename);
};

/**
 * Checks if filename is an excel file format
 *
 * @param {string} filename
 * @return {boolean}
 * @api public
 */
Utils.isExcelFile = function(filename){
  var regex = /\.(xlsx)|(xls)/i;
  return regex.test(filename);
};

module.exports = exports.Utils = Utils;