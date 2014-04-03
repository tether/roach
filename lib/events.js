var redis = require('redis');
var Emitter = require('component-emitter');

/**
 * Expose 'Events'
 */

module.exports = Events;


/**
 * Events constructor.
 * @api public
 */

function Events(pattern) {
	if(!(this instanceof Events)) return new Events(pattern);
	var sub = redis.createClient();
	var _this = this;
	this.pattern = pattern;
	this.client = redis.createClient();
	sub.psubscribe(pattern);
	sub.on('pmessage', function() {

	});
}


//is an emitter

Emitter(Events.prototype);


/**
 * Publish message on patern channel.
 * 
 * @param  {String} topic 
 * @return {this}
 * @api public 
 */

Events.prototype.send = function(topic) {
	this.client.publish();
};