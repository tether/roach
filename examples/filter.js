var _ = require('../../utils')._,
    $ = require('../../utils').$;

module.exports = function(next){
  return function(options){

    this.links = _.map( $(options.selector, document), function(element){
      return element.attribs.href;
    });

    next();
  };
};