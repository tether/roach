var util = require('util');
var _ = require('underscore');
var moment = require('moment');
var timeZones = require('./timezones');

// Constants
// ==========================================
// We are augmenting moment to have some of our constants

/* Day in seconds */
moment.day = moment.duration(1, 'days').asSeconds(); // 86400

/* Hour in seconds */
moment.hour = moment.duration(1, 'hours').asSeconds(); // 3600

/* Minute in seconds */
moment.minute = moment.duration(1, 'minutes').asSeconds(); // 60

/**
 * Returns today in UTC
 *
 * @param {object} options
 * @return {string} location || null
 * @api public
 */
var today = moment.today = function(options){
  options = options || {};

  var date = moment().utc();

  parseInt(options.hours, 10) >= 0 ? date.hours(options.hours) : date.hours(0);
  parseInt(options.minutes, 10) >= 0 ? date.minutes(options.minutes) : date.minutes(0);
  parseInt(options.seconds, 10) >= 0 ? date.seconds(options.seconds) : date.seconds(0);
  parseInt(options.milliseconds, 10) >= 0 ? date.milliseconds(options.milliseconds) : date.milliseconds(0);

  date.setZone(options.offset);

  return date;
};

/**
 * Returns tomorrow in UTC
 *
 * @param {object} options
 * @return {string} location || null
 * @api public
 */
var tomorrow = moment.tomorrow = function(options){
  options = options || {};

  var date = today(options);

  date.add('days', 1);

  return date;
};

/**
 * Returns yesterday in UTC
 *
 * @param {object} options
 * @return {string} location || null
 * @api public
 */
var yesterday = moment.yesterday = function(options){
  options = options || {};

  var date = today(options);

  date.subtract('days', 1);

  return date;
};

/**
 * Returns boolean based on if passed in date is a weekend
 *
 * @param {object} moment
 * @return {boolean}
 * @api public
 */
var isWeekend = moment.isWeekend = function(date){
  var weekend = ['sat', 'sun'];
  var day = date.format('ddd');

  return weekend.indexOf(day.toLowerCase()) !== -1;
};

/**
 * Returns boolean based on if passed in date is a weekend
 *
 * @param {object} moment
 * @return {boolean}
 * @api public
 */
var isWeekday = moment.isWeekday = function(date){
  return !isWeekend(date);
};


/**
 * Get's the number of seconds since epoch
 *
 * @return {integer} seconds since epoch
 * @api public
 */
var getTime = moment.fn.getTime = function(){
  return this.valueOf();
};

/**
 * Set the timezone offset
 *
 * @param {string} time zone offset
 * @return {string} the moment
 * @api public
 */
var setZone = moment.fn.setZone = function(zone) {
  if (zone){
    var offset;

    // TODO (EK): Maybe throw an error if the timezone doesn't exist
    if (!timeZones[zone]) return this;

    // Get timezone offset, compensate for daylight savings time if required
    this.isDST() ? offset = timeZones[zone].daylightSavingsOffset : offset = timeZones[zone].offset;

    // Convert from hours to milliseconds
    var expectedOffset = offset * moment.duration(1, 'hours') * -1;

    // Convert from minutes to milliseconds
    var currentOffset = this._d.getTimezoneOffset() * moment.duration(1, 'minutes');

    this.add('milliseconds', expectedOffset - currentOffset);
  }

  return this;
};

// Expose the date utils
module.exports = moment;