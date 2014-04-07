
/**
 * Crawler dependencies.
 * @api private
 */

var roach = require('../..');
var job = roach.job();
var crawler = roach.crawler();


//subscribe to redis channel in order to be used
//in a separate process

job.subscribe('stocks');


//parse file on start

job.start(parse('file://' + __dirname + '/stocks.text'));


/**
 * Parse local file and tranform data.
 * 
 * @param  {String} name file's name
 * @api private
 */

function parse(name) {
  var lines = 0;
  job.log('start stocks');
  return function() {
    crawler(name)
      .pipe(crawler.split())
      .pipe(crawler.mapSync(function(data) {
         job.progress(lines++);
         job.data(data.toUpperCase());
      }))
      .on('end', function() {
        job.stop();
      });
  };
}