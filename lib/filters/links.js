var Utils = require('../utils'),
    $ = require('cheerio'),
    _ = Utils._;

module.exports = function(document, params){

  var links = _.map( $(params.selector, document), function(element){
    return element.attribs.href;
  });

  return links;

};