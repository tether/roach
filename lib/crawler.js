var utils = require('../utils');
var Door = require('doors');
var _ = require('lodash');
var debug = require('debug')('Crawler');
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var Q = require('q');
var qfs = require('q-io/fs');
var chain = require('chain');
var AdmZip = require('adm-zip');
var path = require('path');

/**
 * Crawler Constructor
 *
 * A Crawler is responsible for fetching files from URLs or from file system
 *
 * @param {string} url
 * @param {object} options
 * @api public
 */
function Crawler(options) {
  this._defaults = {
    url: null,
    headers: {
      'User-Agent': utils.getRandomUserAgent()
    }
  };

  this._filters = [];
  this._steps = [];
  this._tasks = [];
  this._emitter = new EventEmitter();
  this._tasksDoor = new Door('tasks');

  this._subDocCallback = null;

  // If options is a string read in the config file located
  // at this path.
  if ( options && _.isString(options) ){
    this.options = _.extend(this._defaults, this.config(options));
  }
  else {
    this.options = _.extend(this._defaults, options);
  }

  // Events
  this._tasksDoor.on('open', _.bind(this.taskDoorOpen, this));
}

Crawler.prototype.config = function(filePath) {
  // Parse the payload passed in from CLI or Iron.io.
  // TODO (EK): Move this to the CLI component of roach instead
  var payloadIndex = process.argv.indexOf('-payload');
  var options = {};

  if (payloadIndex !== -1){
    payloadIndex += 1;
    filePath = process.argv[payloadIndex];
  }

  // We are intentionally using the synchronous readFile because
  // we don't want anything else to proceed until we have pulled in
  // the config options.
  var file = fs.readFileSync( path.resolve(process.cwd(), filePath) );

  if (file){
    try {
      options = JSON.parse(file);
    }
    catch(error){
      // TODO (EK): Maybe log something instead of just throwing an error
      throw new Error('Invalid JSON');
    }
  }

  return options;
};


Crawler.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};

/**
 * Queues up a GET request for the given url
 *
 * Returns a document as a buffer for zip files or a string
 * for non-zip files.
 *
 * @return {string || buffer} the document body
 * @api private
 */
Crawler.prototype._visit = function(url) {
  var self = this;
  var options = _.extend(this.options, {});

  debug('Fetching URL: %s', url);

  if ( utils.isZipFile(url) ) {
    options.encoding = null;
  }

  var handler = function(next){
    return request.get(options, function(error, response, body){
      if (error) {
        return next(error);
      }

      // If we got an error status code emit the error
      if (response.statusCode !== 200) {
        return next(new Error('Fetch ' + url + ' => ' + response.statusCode));
      }

      if ( utils.isZipFile(url) ) {
        return next(body);
      }

      next(body.toString());
    });
  };

  // Push this get request onto the stack.
  this._steps.push(handler);
};

var next = function(data){
  if (typeof data === 'Error'){
    // TODO (EK): Go to last in the chain or error handler
  }
  // Call the next step in the chain
  else {

    this._steps.arguments
  }
};

/**
 * Sets the URI or file path to visit
 *
 * @param {string} uri - File path or URL
 * @return this
 * @api public
 */
Crawler.prototype.visit = function(uri) {
  if (!uri) {
    throw new Error('You need to provide a URI');
  }

  utils.isURI(uri) ? this._visit(uri) : this._readFile(uri);

  return this;
};


/**
 * Adds a filter to be a applied to the document the proxy fetches
 *
 * @param {string} fpath - Filter path (either custom or in default filters)
 * @param {object} params - Parameter(s) passed to the filter
 * @return {Crawler} this
 * @api public
 */
Crawler.prototype.filter = function( fpath, params ) {
  var filter = this._getFilter(fpath);
  this._addFilter(filter, params);

  return this;
};


/**
 * Looks for the filter in a few different locations and returns it.
 * 
 * @param  {string || function} fpath - the filter path or actual function
 * @return {function} - the filter function
 */
Crawler.prototype._getFilter = function(fpath) {

  // Passing in a plain old function
  if ( _.isFunction(fpath) ) {
    return fpath;
  }

  console.log('fpath', fpath);
    

  var defaultPath = path.resolve(__dirname, 'filters', fpath);
  var filterPath = path.resolve(process.cwd(), fpath);

  // Passing in a default roach filter
  if ( fs.existsSync(defaultPath) ) {
    return require(defaultPath);
  }
  // Passing in a custom filter
  else if ( fs.existsSync(filterPath) ) {
    return require(filterPath);
  }
};


/**
 * Adds a filter function directly to the list of filters to be applied
 *
 * @param {function} callback - The filter function to be called
 * @param {object} params - Parameter(s) passed to the filter
 * @api private
 */
Crawler.prototype._addFilter = function( callback, params ) {
  var handler = function(next, params){
    return callback;
  };

  this._steps.push(handler);
  // this._filters.push([callback, params]);
};


Crawler.prototype.schedule = function(schedule) {
  debug('Adding Schedule');

  this.schedule = schedule;

  return this;
};


/**
 * Actually apply the lazy loaded filters
 *
 *
 * @param {string} document - Fetched document
 * @return {string} document - After filters are applied
 * @api public
 */
Crawler.prototype.applyFilters = function(document) {
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

Crawler.prototype.taskDoorOpen = function() {

  // this._emitter.emit('done', )
};


/**
 * Runs through the built up step chain and actually runs the functions
 *
 * @api private
 */
Crawler.prototype.run = function(job, done) {
  var self = this;

  setTimeout(function(){
    done();
  }, Math.random() * 5000);


  // TODO (EK): May need a promise here to resolve when all of the steps are complete
  // _.each()

  // this._emitter.once('document', function(subDocuments){

  //   // call the sub document's function for each sub document returned
  //   if (_.isArray(subDocuments) && subDocuments.length) {

  //     console.log('Sub Docs', subDocuments);

  //     _.each(subDocuments, self._subDocCallback);
  //   }
  //   else {
  //     // TODO (EK): Replace this error handling with a filter chaining API.
  //     // Let the filter handle the error
  //     self._emitter.emit('error', new Error('Crawler filter must return an array of links'));
  //   }

  //   callback.call(null);
  // });
};

module.exports = Crawler;