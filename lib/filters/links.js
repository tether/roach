var _ = require('../../utils')._,
    $ = require('cheerio');

module.exports = function(document, selector){

  var links = _.map( $(selector, document), function(element){
    return element.attribs.href;
  });

  return links;

};