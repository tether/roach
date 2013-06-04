var str = require('underscore.string');

/** 
 * This file is for underscore.string overrides or additional
 * string helpers we want that aren't in the library
 */

/**
 * Converts a string to camel case
 *
 * @param {string} string
 * @return {string} camelCased string
 * @api public
 */

var camelize = str.camelize = function(string) {
  return string.toLowerCase().trim().replace(/[-_\s]+(.)?/g, function(match, c){ return c.toUpperCase(); });
};

module.exports = str;