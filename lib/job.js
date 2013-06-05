var _ = require('underscore'),

    Parser = require('./parser'),

    EventEmitter = require('events').EventEmitter,

    Proxy = require('./proxy');



function Job( $url, $name ) {

    var self = this;

    this._name = $name;

    this._emitter = new EventEmitter();

    this._proxy = new Proxy($url);

    this._proxy.on('document', this.document, this);

    //name for job door
    this._parser = new Parser($name);

    this._parser.on('parsed', this.parsed, this);

    this._parser.on('parse:end', this.exit, this);

}

Job.prototype.on = function( name, callback, scope ) {

    this._emitter.on( name, _.bind( callback, scope ) );

};


Job.prototype.filter = function( path, params ) {

    this._parser.filter.call(this._parser, path, params);

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

Job.prototype.document = function(document){

    this._parser.setDocument(document);

    this._parser.applyFilters();
};

Job.prototype.parsed = function(type, data){
    // We re-emit this event for roach to listen to
    this._emitter.emit('job:parsed', type, data);
};


Job.prototype.exit = function(name){
    this._emitter.emit('exit', name);
};

module.exports = Job;