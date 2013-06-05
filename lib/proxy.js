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

util.inherits(Proxy, EventEmitter);


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
 * Fetches a URL
 *
 * @param {object} options
 * @api public
 */
Proxy.prototype.fetch = function() {
  var self = this;

  request.get(this._options, function(error, response, body){

    if (error) self.emit('error', error);

    // If we got an error status code emit the error
    if (response.statusCode !== 200) {

      self.emit('error', new Error('Fetch ' + self._options.url + ' => ' + response.statusCode));
    }

    // TODO: Handle Errors for chaining API
    self.emit( 'document', self.applyFilters(body.toString()) );

    // TODO: Maybe create new Proxy?

  });
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

  this.once('document', function( subDocuments){

    if(_.isArray(subDocuments)){

      _.each(subDocuments, self._subDocCallback);

    }

    callback.call(null);

  });

};

module.exports = Proxy;