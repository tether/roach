var httpUtils = require('../utils/http'),

    _ = require('underscore'),

    request = require('request'),

    EventEmitter = require('events').EventEmitter,

    util = require('util'),

    fs = require('fs'),

    AdmZip = require('adm-zip'),

    path = require('path');

/**
 * Proxy constructor.
 * data object.
 */

function Proxy( url, $config ) {

  this._filters = [];

  this.options = null;

  this._emitter = new EventEmitter();

  this._subDocCallback = null;

  this._defaults = {
      url: null,
      headers: {
        'User-Agent': httpUtils.getRandomUserAgent()
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

Proxy.prototype._readFile = function() {
  var self = this;

  var file = this.options.file;

  fs.readFile(path.resolve(file), 'utf-8', function(error, data){
    if (error) return self._emitter.emit('error', error);

    if ( self.isZipFile(self.options.file) ) {

      return self._emitter.emit( 'document', self.applyFilters(data) );
    }

    self._emitter.emit('document', self.applyFilters(data.toString()) );
  });
};

Proxy.prototype.isZipFile = function(filename){
  var regex = /\.zip/i;
  return regex.test(filename);
};

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
 * Fetches a URL, a file or a folder
 *
 * @param {object} options
 * @api public
 */
Proxy.prototype.fetch = function() {

    this.options.url ? this._visit() : this._readFile();
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