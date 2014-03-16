
/**
 * Expose 'Utils'
 */

exports = module.exports = require('util');


/**
 * Mixin two objects (clone properties).
 * example:
 *
 *   utils.mixin(to, from);
 *
 * @param {Object} to 
 * @param {Object} from 
 * @return {object} to
 * @api public
 */

exports.mixin = function(to, from) {
  for (var key in from) {
    if (from.hasOwnProperty(key)) {
      to[key] = from[key];
    }
  }
  return to;
};

/**
 * Clone Objects.
 * example:
 *
 *   utils.clone(to);
 *
 * Arrays are objects in JavaScript.
 * 
 * @return  {Object} 
 * @api public
 */

exports.clone = require('clone-bredele');