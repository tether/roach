var Roach = require('../index');
var Crawler = Roach.Crawler;

var roach = new Roach();

roach.use('logger').start();

var crawler = new Crawler({
  title: 'apple'
});

crawler
.visit('http://apple.com')
.schedule('every hour')
.filter('links', {
  selector: '#globalnav a'
});

roach.schedule(crawler);

// crawler
// .use('casper')
// .visit('http://apple.com')
// .submit({
//   'email': 'hulk@hogan.com',
//   'password': 'password'
// })
// .filter('links', {
//   selector: '#globalnav a'
// })
// .then(
//   crawler
//   .visit(url)
//   .filter('error')
//   .filter('image')
//   .filter('archiver')
// );
// 
// roach.schedule(crawler)
