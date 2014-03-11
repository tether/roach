## Crawlers

Each crawler is essentially a special job that can be run by must have a few things:

### API

- visit
- schedule
- filter

### Basic

```js
var Roach = require('../index');
var roach = new Roach();

var crawler = new Crawler(options);

crawler
.visit('http://apple.com')
.schedule('every hour')
.filter('links', {
  selector: '#globalnav a'
});
```