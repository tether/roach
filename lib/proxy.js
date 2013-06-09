var requestUtils = require('../utils/request'),

    _ = require('underscore'),

    request = require('request'),

    EventEmitter = require('events').EventEmitter,

    util = require('util'),

    fs = require('fs'),

    AdmZip = require('adm-zip'),

    path = require('path');


/**
 * Proxy Constructor
 *
 * A Proxy is responsible for fetching files from URLs or from file system
 *
 * @param {string} url
 * @param {object} $config
 * @api public
 */
function Proxy( url, $config ) {

  this._filters = [];

  this.options = null;

  this._emitter = new EventEmitter();

  this._subDocCallback = null;

  this._defaults = {
      url: null,
      headers: {
        'User-Agent': requestUtils.getRandomUserAgent()
      }
  };

  if ( this.isURI(url) ){
    this._defaults.url = url;
  }
  else if (url) {
    this._defaults.file = path.resolve(process.cwd(), url);
  }

  //default options?
  this.options = _.extend(this._defaults, $config);

}


Proxy.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};


/**
 * Adds a filter to be a applied to the document the proxy fetches
 *
 *
 * @param {string} fpath - Filter path (either custom or in default filters)
 * @param {object} params - Parameter(s) passed to the filter
 * @return {Proxy} this
 * @api public
 */
Proxy.prototype.filter = function( fpath, params ) {

      var defaultPath = path.resolve(__dirname, 'filters', fpath + '.js'),

          filterPath = path.resolve(process.cwd(), fpath);

      if ( fs.existsSync(defaultPath) ){

          this.addFilter( require(defaultPath), params );

      }
      else if ( fs.existsSync(filterPath) ){

          this.addFilter( require(filterPath), params );

      }

      // TODO (EK): Maybe return an error if transport doesn't exist

      return this;
};


/**
 * Adds a filter function directly to the list of filters to be applied
 *
 * Could be used publicly but filter() is preferred.
 *
 * @param {function} callback - The filter function to be called
 * @param {object} params - Parameter(s) passed to the filter
 * @api public
 */
Proxy.prototype.addFilter = function( callback, params ) {
    this._filters.push([callback, params]);
};


/**
 * Actually apply the lazy loaded filters
 *
 *
 * @param {string} document - Fetched document
 * @return {string} document - After filters are applied
 * @api public
 */
Proxy.prototype.applyFilters = function(document) {


    _.each(this._filters, function(filter){

      var callback = filter[0],
          params = filter[1];

      // Call the previously stored filter function passing the
      // augmented document into each filter
      document = callback(document, params);

    });

    return document;
};


/**
 * Calls the callback function for each result returned from
 * a filter.
 *
 * @param {function} callback
 * @return {Proxy} this
 * @api public
 */
Proxy.prototype.each = function(callback) {

  if (typeof callback === 'function') {

    this._subDocCallback = callback;
  }

  return this;

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
Proxy.prototype.isURI = function( uri ) {
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
Proxy.prototype.isZipFile = function(filename){
  var regex = /\.zip/i;
  return regex.test(filename);
};


/**
 * Reads in a file based on this.options.file
 *
 * Emits a document event with a buffer for zip files or a string
 * for non-zip files.
 *
 * @return {string || buffer} emits a 'document' event
 * @api private
 */
Proxy.prototype._readFile = function() {
  var self = this;

  var file = path.resolve(this.options.file);

  fs.stat(file, function(error, stats){
    if (error) return self._emitter.emit('error', error);

    if (stats.isDirectory()){
      // TODO (EK): Maybe we can just add the directory filter automatically here
      // instead of returning.

      return self._emitter.emit('document', self.applyFilters(file) );
    }

    fs.readFile(file, 'utf-8', function(error, data){
      if (error) return self._emitter.emit('error', error);

      if ( self.isZipFile(self.options.file) ) {

        return self._emitter.emit( 'document', self.applyFilters(data) );
      }

      self._emitter.emit('document', self.applyFilters(data.toString()) );
    });

  });
};


/**
 * Fetches a file from a this.options.url
 *
 * Emits a document event with a buffer for zip files or a string
 * for non-zip files.
 *
 * @return {string || buffer} emits a 'document' event
 * @api private
 */
Proxy.prototype._visit = function() {
  var self = this;

  if ( this.isZipFile(this.options.url) ) this.options.encoding = null;

  request.get(this.options, function(error, response, body){

    if (error) return self._emitter.emit('error', error);

    // If we got an error status code emit the error
    if (response.statusCode !== 200) {

      return self._emitter.emit('error', new Error('Fetch ' + self.options.url + ' => ' + response.statusCode));
    }

    if ( self.isZipFile(self.options.url) ) {

      return self._emitter.emit( 'document', self.applyFilters(body) );
    }

    self._emitter.emit( 'document', self.applyFilters(body.toString()) );

  });
};


/**
 * Fetches a URL, a file or a folder. Calls _visit() or _readfile()
 *
 * @api public
 */
Proxy.prototype.fetch = function() {

    this.options.url ? this._visit() : this._readFile();
};


/**
 * Calls the callback function after all the callbacks passed into
 * each have been called.
 *
 * @param {function} callback
 * @api public
 */
Proxy.prototype.run = function( callback ) {

  var self = this;

  this.fetch();

  this._emitter.once('document', function( subDocuments){

    // call the sub document's function for each sub document returned
    if(subDocuments && _.isArray(subDocuments) && subDocuments.length){

      _.each(subDocuments, self._subDocCallback);
    }
    else {
      // TODO (EK): Replace this error handling with a filter chaining API.
      // Let the filter handle the error
      self._emitter.emit('error', new Error('Proxy filter must return an array of links'));
    }

    callback.call(null);

  });

};

module.exports = Proxy;