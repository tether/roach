/**
 * Module dependencies.
 */
var queue;

module.exports = function(app){
  queue = new app.Queue();

  app.get('/', function(req, res){
    queue.types(function(err, types){
      res.render('home', {
        types: types
      });
    });
  });
  app.get('/active', status('active'));
  app.get('/inactive', status('inactive'));
  app.get('/failed', status('failed'));
  app.get('/complete', status('complete'));
  app.get('/delayed', status('delayed'));
};

function status(state){
  return function(req, res){
    queue.types(function(err, types){
      res.render('job/list', {
        state: state,
        types: types
      });
    });
  };
}