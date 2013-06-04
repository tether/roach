var Utils = {};

Utils.http = require('./http');
Utils.date = require('./date');
Utils._ = require('underscore');
Utils.str = Utils._.str = require('./string');

// Mix in non-conflict functions to Utils._ namespace
Utils._.mixin(Utils._.str.exports());

// All functions, include conflict, will be available through _.str object
Utils._.str.include('Underscore.string', 'string'); // => true

module.exports = exports.Utils = Utils;