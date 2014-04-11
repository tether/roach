var _ = require('lodash');
var errors = require('./errors');

module.exports = function(err, req, res, next) {
  if (typeof err === 'string' || !(err instanceof errors.AbstractError)) {
    err = new errors.GeneralError(err);
  }

  var statusCode = typeof err.code === 'number' ? err.code : 500;

  res.status(statusCode);
  req.app.log(req.url, err.stack || err);

  res.format({
    'text/html': function(){
      if(req.app.settings.env === 'development') {
        return res.send(err);
      }

      var errorPath = req.app.get('redirect') + err.className;
      res.redirect(errorPath);
    },

    'application/json': function(){
      res.json(_.pick(err, 'message', 'name', 'code', 'className'));
    },

    'text/plain': function(){
      res.send(err.message);
    }
  });
};