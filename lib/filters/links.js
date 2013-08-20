var _ = require('../../utils')._,
    $ = require('../../utils').$;

module.exports = function(document, selector){

  var links = _.map( $(selector, document), function(element){
    return element.attribs.href;
  });

  return links;

};