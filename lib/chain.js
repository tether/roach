/**
 * Expose 'Chain'
 */
module.exports = new Chain();


/**
 * Initialize a new Chain
 * @param {Object} data Object to filter
 */

function Chain() {
  this.steps = [];
}


/**
 * Add chaining sequence
 * @param {Object} data Object to filter
 * @param {Boolean} each true, iterate through each attribute of the object
 * 
 * @return {Chain} Chain
 * @api public
 */

Chain.prototype.from = function(data, bool) {
  this.iterate = is.truthy(is.defined(bool) ? bool : this.iterate);
  this.data = data || [];
  return this;
};


/**
 * Add chaining filter
 * 
 * @return {Chain} Chain
 * @api public
 */

Chain.prototype.use = function(fn, scope) {
  this.stack.push([fn, scope]);
  return this;
};


/**
 * Execute filter callback filter
 * 
 * @return {Chain} Chain
 * @api private
 */

Chain.prototype.handle = function(item) {
  var index = 0,
      self = this;

  this.result = (function next(data) {
    var handler = self.stack[index++];
    if(handler) {
      handler[0].call(handler[1], next, data);
    }
    return data;
    
  })(item);

};


/**
 * Add chaining bucket.
 * 
 * 
 * @return {Chain} Chain
 * @api public
 */

Chain.prototype.bucket = function(buffer) {
  this.use(function(next, data){
    buffer.push(data);
    next(data);
  });
  return this;
};


/**
 * Lazy evaluation.
 *
 * @return {Chain} Chain
 * @api public
 */

Chain.prototype.done = function() {

  if(this.iterate) {
    var that = this;
    each(this.data, function(item){
      that.handle(item);
    });
  } else {
    this.handle(this.data);
  }
};

/**
 * Execute callback when error(s) occured
 * 
 * @return {Chain} Chain
 * @api public
 */

Chain.prototype.error = function(fn, scope) {

};