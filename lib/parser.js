var _ = require('underscore'),
    fs = require('fs'),
    path = require('path');



function Parser($name) {

    this._name = $name;

    this._filters = [];

    this.emitter = null;

    this._document = null;

}

Parser.prototype.setEmitter = function(emitter) {

    // TODO: Check type of EventEmitter?

    this._emitter = emitter;
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


Parser.prototype.addFilter = function( callback ) {
    this._filters.push(callback, params);
};

Parser.prototype.applyFilters = function() {

    var self = this;

    _.each(this._filters, function(filter){

        self._document = filter.call(null, self._document, self._emitter);
    });

    this._emitter.emit('parse:end', this._name);

    return this._document;
};

module.exports = Parser;

