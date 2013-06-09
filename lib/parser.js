var _ = require('underscore'),
    fs = require('fs'),

    EventEmitter = require('events').EventEmitter,

    path = require('path');



/**
 * Parser Constructor
 *
 * A Parser is responsible for applying filters to a given document
 *
 * @param {string} $name
 * @api public
 */
function Parser($name) {

    this._name = $name;

    this._filters = [];

    this._emitter = new EventEmitter();

    this._document = null;

}


Parser.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};


/**
 * Lazily set the document we want to parse
 *
 * @param {string} document
 * @api public
 */
Parser.prototype.setDocument = function(document) {

    // TODO (EK): For now a document is assumed to be a string. 
    // We need to clone if we want to work with objects

    this._document = document;
};


/**
 * Adds a filter to be a applied to the document
 *
 *
 * @param {string} fpath - Filter path (either custom or in default filters)
 * @param {object} params - Parameter(s) passed to the filter
 * @return {Parser} this
 * @api public
 */
Parser.prototype.filter = function( fpath, params ) {

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
Parser.prototype.addFilter = function( callback, params ) {
    this._filters.push([callback, params]);
};


/**
 * Actually apply the lazy loaded filters to this._document
 *
 * @return {string} document - After filters are applied
 * @api public
 */
Parser.prototype.applyFilters = function() {

    var self = this;

    _.each(this._filters, function(filter){

      var callback = filter[0],
          params = filter[1];

      self._document = callback(self._document, params, self._emitter);

    });

    this._emitter.emit('parse:end', this._name);

    return this._document;
};

module.exports = Parser;

