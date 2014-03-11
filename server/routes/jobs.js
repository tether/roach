/**
 * Module dependencies.
 */

var Queue;
var Job;
var reds;
var queue;
var roach;

module.exports = function(app) {
  Queue = app.Queue;
  Job = Queue.Job;
  queue = Queue.createQueue();
  roach = app.roach;
  reds = require('reds');

  /* Routes */
  app.get('/stats', stats);
  app.get('/jobs/search', search);
  app.get('/jobs/:from..:to/:order?', jobRange);
  app.get('/jobs/:type/:state/:from..:to/:order?', jobTypeRange);
  app.get('/jobs/:state/:from..:to/:order?', jobStateRange);
  app.get('/jobs/types', types);
  app.get('/jobs/:id', job);
  app.get('/jobs/:id/log', log);
  app.put('/jobs/:id/state/:state', updateState);
  app.put('/jobs/:id/priority/:priority', updatePriority);
  app.post('/jobs', createJob);
  app.del('/jobs/:id', remove);
};

/**
 * Get statistics including:
 *
 *   - inactive count
 *   - active count
 *   - complete count
 *   - failed count
 *   - delayed count
 *
 */

var stats = exports.stats = function(req, res){
  get(queue)
    ('inactiveCount')
    ('completeCount')
    ('activeCount')
    ('failedCount')
    ('delayedCount')
    ('workTime')
    (function(err, obj){
      if (err) return res.json({ error: err.message });
      res.json(obj);
    });
};

/**
 * Get job types.
 */

var types = exports.types = function(req, res){
  queue.types(function(err, types){
    if (err) return res.json({ error: err.message });
    res.json(types);
  });
};

/**
 * Get jobs by range :from..:to.
 */

var jobRange = exports.jobRange = function(req, res){
  var state = req.params.state;
  var from = parseInt(req.params.from, 10);
  var to = parseInt(req.params.to, 10);
  var order = req.params.order;

  Job.range(from, to, order, function(err, jobs){
    if (err) return res.json({ error: err.message });
    res.json(jobs);
  });
};

/**
 * Get jobs by :state, and range :from..:to.
 */

var jobStateRange = exports.jobStateRange = function(req, res){
  var state = req.params.state;
  var from = parseInt(req.params.from, 10);
  var to = parseInt(req.params.to, 10);
  var order = req.params.order;

  Job.rangeByState(state, from, to, order, function(err, jobs){
    if (err) return res.json({ error: err.message });
    res.json(jobs);
  });
};

/**
 * Get jobs by :type, :state, and range :from..:to.
 */

var jobTypeRange = exports.jobTypeRange = function(req, res){
  var type = req.params.type;
  var state = req.params.state;
  var from = parseInt(req.params.from, 10);
  var to = parseInt(req.params.to, 10);
  var order = req.params.order;

  Job.rangeByType(type, state, from, to, order, function(err, jobs){
    if (err) return res.json({ error: err.message });
    res.json(jobs);
  });
};

/**
 * Get job by :id.
 */

var job = exports.job = function(req, res){
  var id = req.params.id;
  Job.get(id, function(err, job){
    if (err) return res.json({ error: err.message });
    res.json(job);
  });
};

/**
 * Create a job.
 */

var createJob = exports.createJob = function(req, res) {
  var body = req.body;

  if (!body.type) return res.json({ error: 'Must provide job type' }, 400);

  var job = new Job(body.type, body.data || {});
  var options = body.options || {};
  if (options.attempts) job.attempts(parseInt(options.attempts));
  if (options.priority) job.priority(options.priority);
  if (options.delay) job.delay(options.delay);

  // TODO (EK):
  // * Lookup the crawler type to make sure it matches
  // * Schedule crawler through roach roach.schedule(Job)

  job.save(function(err) {
    if (err) return res.json({ error: err.message }, 500);
    res.json({ message: 'job created', id: job.id });
  });
};

/**
 * Remove job :id.
 */

var remove = exports.remove = function(req, res){
  var id = req.params.id;
  Job.remove(id, function(err){
    if (err) return res.json({ error: err.message });
    res.json({ message: 'job ' + id + ' removed' });
  });
};

/**
 * Update job :id :priority.
 */

var updatePriority = exports.updatePriority = function(req, res){
  var id = req.params.id
    , priority = parseInt(req.params.priority, 10);

  if (isNaN(priority)) return res.json({ error: 'invalid priority' });
  Job.get(id, function(err, job){
    if (err) return res.json({ error: err.message });
    job.priority(priority);
    job.save(function(err){
      if (err) return res.json({ error: err.message });
      res.json({ message: 'updated priority' });
    });
  });
};

/**
 * Update job :id :state.
 */

var updateState = exports.updateState = function(req, res){
  var id = req.params.id
    , state = req.params.state;

  Job.get(id, function(err, job){
    if (err) return res.json({ error: err.message });
    job.state(state);
    job.save(function(err){
      if (err) return res.json({ error: err.message });
      res.json({ message: 'updated state' });
    });
  });
};

/**
 * Search and respond with ids.
 */

var search = exports.search = function(req, res){
  getSearch().query(req.query.q).end(function(err, ids){
    if (err) return res.json({ error: err.message });
    res.json(ids);
  });
};

/**
 * Get log for job :id.
 */

var log = exports.log = function(req, res){
  var id = req.params.id;
  Job.log(id, function(err, log){
    if (err) return res.json({ error: err.message });
    res.json(log);
  });
};

/**
 * Search instance.
 */

var redisSearch;
function getSearch() {
  if (redisSearch) return redisSearch;
  reds.createClient = Queue.redis.createClient;
  redisSearch = reds.createSearch('q:search');

  return redisSearch;
}

/**
 * Data fetching helper.
 */

function get(obj) {
  var pending = 0;
  var res = {};
  var callback;
  var done;

  return function _(arg){
    switch (typeof arg) {
      case 'function':
        callback = arg;
        break;
      case 'string':
        ++pending;
        obj[arg](function(err, val){
          if (done) return;
          if (err) return done = true, callback(err);
          res[arg] = val;
          --pending || callback(null, res);
        });
        break;
    }
    return _;
  };
}
