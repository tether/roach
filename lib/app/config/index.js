var _ = require('lodash');
var path = require('path');
var debug = require('debug')('api');

module.exports = function () {
  var app = this;
  var env = app.settings.env;
  var config = require('./' + env + '.json');

  _.each(config, _.bind(function (value, name) {
    // Make relative paths absolute
    if(typeof value === 'string' &&
        (value.indexOf('./') === 0 || value.indexOf('../') === 0)) {
      value = path.resolve(__dirname, '..', value);
    }

    debug('Setting configuration value "' + name + '"', value);
    app.set(name, value);
  }));

  debug('Set up configuration for "' + env + '" environment');
};
