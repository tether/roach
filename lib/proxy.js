var httpUtils = require('../utils/http'),

    _ = require('underscore'),

    request = require('request'),

    EventEmitter = require('events').EventEmitter,

    util = require('util'),

    fs = require('fs'),

    path = require('path');

/**
 * Proxy constructor.
 * data object.
 */

function Proxy( url, $config ) {

  this._filters = [];

  this._options = null;

  this._emitter = new EventEmitter();

  this._subDocCallback = null;

  this._defaults = {
      url: url,
      headers: {
        'User-Agent': httpUtils.getRandomUserAgent()
      }
  };

  //default options?
  this._options = _.extend(this._defaults, $config);

}

Proxy.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};

Proxy.prototype.filter = function( fpath, params ) {

      var defaultPath = path.resolve(__dirname, 'filters', fpath + '.js'),

          filterPath = path.resolve(process.cwd(), fpath);

      if ( fs.existsSync(defaultPath) ){

          this.addFilter( require(defaultPath), params );

      }
      else if ( fs.existsSync(filterPath) ){

          this.addFilter( require(filterPath), params );

      }

      // TODO: Maybe return an error if transport doesn't exist

      return this;
};



// TODO: Apply filters to procy
// 
Proxy.prototype.addFilter = function( callback, params ) {
    this._filters.push([callback, params]);
};


Proxy.prototype.applyFilters = function(document) {


    _.each(this._filters, function(filter){

      var callback = filter[0],
          params = filter[1];

      document = callback(document, params);

    });

    return document;
};

/**
 * Regex pulled from http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url.
 */

Proxy.prototype.isURI = function( uri ) {
  var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

  return regex.test(uri);
};

Proxy.prototype._readFile = function( filePath ) {
  // body...
};

Proxy.prototype._visit = function() {
  request.get(this._options, function(error, response, body){

    if (error) self._emitter.emit('error', error);

    // If we got an error status code emit the error
    if (response.statusCode !== 200) {

      self._emitter.emit('error', new Error('Fetch ' + self._options.url + ' => ' + response.statusCode));
    }

    // console.log('Fetched: ' + self._options.url);

    // TODO: Handle Errors for chaining API
    self._emitter.emit( 'document', self.applyFilters(body.toString()) );

    // TODO: Maybe create new Proxy?

  });
};


/**
 * Fetches a URL, a file or a folder
 *
 * @param {object} options
 * @api public
 */
Proxy.prototype.fetch = function() {
  var self = this;

  this.isURI(this.options.url) ? this._visit() : this._readFile();
};

Proxy.prototype.each = function(callback) {

  if (typeof callback === 'function') {

    this._subDocCallback = callback;

  }

  return this;

};

//do we need run? can we call fetch inside each?
Proxy.prototype.run = function( callback ) {

  var self = this;

  this.fetch();

  this._emitter.once('document', function( subDocuments){

    if(_.isArray(subDocuments)){

      _.each(subDocuments, self._subDocCallback);

    }

    callback.call(null);

  });

};

module.exports = Proxy;