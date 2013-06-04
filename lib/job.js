var _ = require('underscore'),
    Parser = require('./parser'),
    Proxy = require('./proxy');

module.exports = (function () {


    function Job( $url, $name ) {

        var self = this;

        //name for job door
        this._parser = new Parser($name);

        this._proxy = new Proxy($url);

        this._proxy.on('document', function(document){

            self._parser.setDocument(document);

            self._parser.applyFilters();
        });

    }

    Job.prototype.setEmitter = function(emitter) {
        this._parser.setEmitter(emitter);
    };


    Job.prototype.filter = function( path ) {

        this._parser.filter.call(this._parser, path);

        return this;
    };

    Job.prototype.getProxy = function(){
        return this._proxy;
    };


    Job.prototype.addFilter = function(){
        this._parser.addFilter.call(this._parser, arguments);
    };

    Job.prototype.run = function(){
        this._proxy.fetch();
    };

    return Job;

})();