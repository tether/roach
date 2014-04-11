var feathers = require('feathers');
var debug = require('debug')('api');
var feathers = require('feathers');
var app = feathers();
var errorHandler = require('./lib/error-handler');

// Get Config based on ENV
try {
  config = require('./config/' + app.settings.env + '.json');
}
catch(error){
  debug(error);
}


// Exposed Services
var jobService = require('./services/job');
var crawlerService = require('./services/crawler');


/**
 * Initialize the app with the roach context
 */

function initialize(roach){
  // Configure the API
  app.configure(require('./config'))
    .use(feathers.compress())
    .use(feathers.cookieParser())
    // .use(feathers.session({
    //   secret: app.get('session-secret'),
    //   store: new MongoStore({
    //     url: app.get('mongodb')
    //   })
    // }))
    .use(feathers.static(app.get('frontend')))
    .use('/jobs', jobService({ roach: roach }))
    .use('/crawlers', crawlerService({ roach: roach }))
    .use(function(req, res, next){
      next(new app.errors.NotFound('Page not found.'));
    })
    .use(errorHandler);
}

// Expose the API
module.exports = function(roach){
  initialize(roach);
  
  app.listen(app.get('port'));
  debug('Roach API Initialized.');
  debug('Listening on %s:%s', app.get('host'), app.get('port'));

  // roach.use(jobService.job);
  // roach.use(crawlerService.job);

  return app;
};