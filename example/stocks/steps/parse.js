var crawler = require('../../..').crawler();

/**
 * Expose 'parse'
 */

module.exports = parse;


/**
 * parse constructor.
 * @api public
 */

function parse(next, done) {
  this
    .pipe(crawler.split())
    .pipe(crawler.mapSync(function(data) {
       next(data.toUpperCase());
    }));
}
