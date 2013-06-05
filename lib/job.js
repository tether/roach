var _ = require('underscore'),

    Parser = require('./parser'),

    Proxy = require('./proxy');



function Job( $url, $name ) {

    var self = this;

    this._name = $name;

    this._emitter = null;

    //name for job door
    this._parser = new Parser($name);

    this._proxy = new Proxy($url);

    this._proxy.on('document', function(document){

        self._parser.setDocument(document);

        self._parser.applyFilters();
    });

}

Job.prototype.setEmitter = function(emitter) {
    this._emitter = emitter;

    this._emitter.on('parse:end', this.exit);

    // Pass the singleton emitter instance to the parser
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

Job.prototype.exit = function(){
    this._emitter.emit('exit', this._name);
};

module.exports = Job;