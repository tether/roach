var _ = require('../../utils')._,
    $ = require('cheerio');

module.exports = function(document, selector){

  console.log(selector);

  var links = _.map( $(selector, document), function(element){
    return element.attribs.href;
  });

  console.log(links);

  return links;

};