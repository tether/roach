var _ = require('underscore');

module.exports = (function () {


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


    Parser.prototype.filter = function( path ) {

        if ( require.resolve(path) ){

            this.addFilter( require(path) );

        }
        // TODO: Maybe return an error if transport doesn't exist

        return this;
    };


    Parser.prototype.addFilter = function( callback ) {
        this._filters.push(callback);
    };

    Parser.prototype.applyFilters = function() {
        var self = this;

        _.each(this._filters, function(filter){

            self._document = filter.call(null, self._document, self._emitter);
        });

        this._emitter.emit('parse:end');

        return this._document;
    };

    return Parser;

})();

