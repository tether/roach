/**
 * Converts a string to camel case
 *
 * @param {string} string
 * @return {string} camelCased string
 * @api public
 */

exports.camelize = function(string) {
  return string.toLowerCase().trim().replace(/[-_\s]+(.)?/g, function(match, c){ return c.toUpperCase(); });
};