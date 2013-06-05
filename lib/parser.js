var _ = require('underscore'),
    fs = require('fs'),

    EventEmitter = require('events').EventEmitter,

    path = require('path');



function Parser($name) {

    this._name = $name;

    this._filters = [];

    this._emitter = new EventEmitter();

    this._document = null;

}

Parser.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};

Parser.prototype.setDocument = function(document) {

    // TODO: For now a document is assumed to be a string. 
    // We need to clone if we want to work with objects

    this._document = document;
};


Parser.prototype.filter = function( fpath, params ) {

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


Parser.prototype.addFilter = function( callback, params ) {
    this._filters.push([callback, params]);
};

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

