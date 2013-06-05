var Utils = require('../../utils'),
    $ = require('cheerio'),
    _ = Utils._;

module.exports = function(document, selector){

  var links = _.map( $(selector, document), function(element){
    return element.attribs.href;
  });

  return links;

};