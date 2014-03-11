var utils = require('../utils'),
    _ = require('lodash'),
    debug = require('debug')('Proxy'),
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
 * @param {object} options
 * @api public
 */
function Proxy( url, options ) {
  this._filters = [];

  this._emitter = new EventEmitter();

  this._subDocCallback = null;

  this._defaults = {
    url: null,
    headers: {
      'User-Agent': utils.getRandomUserAgent()
    }
  };

  if ( utils.isURI(url) ){
    this._defaults.url = url;
  }
  else if (url) {
    this._defaults.file = path.resolve(process.cwd(), url);
  }

  //default options?
  this.options = _.extend(this._defaults, options);
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

  if ( fs.existsSync(defaultPath) ) {
    this.addFilter( require(defaultPath), params );
  }
  else if ( fs.existsSync(filterPath) ) {
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
  var self = this;

  debug('Applying Filters');

  _.each(this._filters, function(filter){

    var callback = filter[0],
        params = filter[1];

    // Call the previously stored filter function passing the
    // augmented document into each filter
    document = callback(document, params, self._emitter);

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

  debug('Fetching File: %s', this.options.file);

  fs.stat(file, function(error, stats){
    if (error) return self._emitter.emit('error', error);

    if (stats.isDirectory()){
      // TODO (EK): Maybe we can just add the directory filter automatically here
      // instead of returning.

      return self._emitter.emit('document', self.applyFilters(file) );
    }

    fs.readFile(file, function(error, data){
      if (error) return self._emitter.emit('error', error);

      if ( utils.isZipFile(self.options.file) || utils.isExcelFile(self.options.file) ) {

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

  debug('Fetching URL: %s', this.options.url);

  if ( utils.isZipFile(this.options.url) ) {
    this.options.encoding = null;
  }

  request.get(this.options, function(error, response, body){

    if (error) return self._emitter.emit('error', error);

    // If we got an error status code emit the error
    if (response.statusCode !== 200) {

      return self._emitter.emit('error', new Error('Fetch ' + self.options.url + ' => ' + response.statusCode));
    }

    if ( utils.isZipFile(self.options.url) ) {

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
 * Submits data to a URL
 *
 * @api public
 */
Proxy.prototype.submit = function() {
  var self = this;

  debug('Submiting data %s to URL: %s', this.options.form, this.options.url);

  request.post(this.options, function(error, response, body){
    if (error) return self._emitter.emit('error', error);

    // If we got an error status code emit the error
    if (response.statusCode !== 200) {
      return self._emitter.emit('error', new Error('Fetch ' + self.options.url + ' => ' + response.statusCode));
    }

    self._emitter.emit( 'document', self.applyFilters(body.toString()) );
  });
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

  if (this.options.form) {
    this.submit();
  }
  else {
    this.fetch();
  }

  this._emitter.once('document', function(subDocuments){

    // call the sub document's function for each sub document returned
    if (_.isArray(subDocuments) && subDocuments.length) {

      console.log('Sub Docs', subDocuments);

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