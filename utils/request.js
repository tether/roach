var _ = require('underscore');

/**
 * Returns a random user agent from a predefined list of agent strings
 *
 * @return {string} user agent
 * @api public
 */
exports.getRandomUserAgent = function(){
  var userAgents = {
    ie9: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
    ie8: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
    ie7: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    firefoxMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:19.0) Gecko/20100101 Firefox/19.0',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22',
    operaMac: 'Opera/9.80 (Macintosh; Intel Mac OS X 10.8.2) Presto/2.12.388 Version/12.14',
    firefoxWin: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; it; rv:1.8.1.11) Gecko/20071127 Firefox/2.0.0.11',
    operaWin: 'Opera/9.25 (Windows NT 5.1; U; en)',
    firefoxLinux: 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.12) Gecko/20070731 Ubuntu/dapper-security Firefox/1.5.0.12'
  };

  var agents = _.values(userAgents);
  var index = Math.floor(Math.random() * agents.length);

  return agents[index];
};