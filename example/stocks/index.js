var roach = require('../..');

var job = module.exports = roach.job();
var crawler = roach.crawler();

console.log('subscribe stocks');
job.subscribe('stocks');


var lines = 0;

job.start(function() {
  job.log('start stocks');
  crawler('file://' + __dirname + '/stocks.text')
    .pipe(crawler.split())
    .pipe(crawler.mapSync(function(data) {
       job.progress(lines++);
       job.data(data.toUpperCase());
    }))
    .on('end', function() {
      job.stop();
    });
});

