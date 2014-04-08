# crawler

  > status : [public](#concept)

## Concept

 A Crawler is a bundle of 'pipable' utils. 

```js
var crawler = roach.crawler(mixin);
crawler('http://domain/file.json')
  .pipe(crawler.parse())
  .pipe(crawler.mapSync(function() {
		do something
	}))
	.pipe(crawler.wait()); //wait end and concat strings
```

 With `crawler` you can get files locally or through http, you can parse JSON, text, XML, HTML or CSV and way more (see [api](#api)).

## API

### utils

 `crawler` is a toolkit to make creating and working with streams easy. It contains multiples utils such as:
   - end (alias for on('end'))
   - split
   - join
   - parse
   - stringify
   - map
   - wait
   - through
   - etc.

  To se thee full list, please see [event-stream](https://github.com/dominictarr/event-stream).

### crawler(url)

 Get file (alias `get`) from disk or through http. A crawler is smart enough to know what to do!

```js
//get through http
crawler('http://domain/file.json');

//get from disk
crawler('file://user/path/file.txt');
```


### .get(url)

 Get file (alias `get`) from disk or through http.

```js
//get through http
crawler.get('http://domain/file.json');

//get from disk
crawler.get('file://user/path/file.txt');
```

### .file(url)

 Get file from disk.

```js
//get from disk
crawler.file('/user/path/file.txt');
```

### .http(url)

 Get file from disk.

```js
//get through http
crawler.http('http://domain/file.json');
```

### .html(cb)

 Parse HTML and stream result.

```js
crawler(/* url */)
  .pipe(crawler.html());

```

 The callback `cb` allows you to get access to the parser (with the query selection engine):

```js
crawler(/* url */)
  .pipe(crawler.html(function() {
    this.select('li.link')
    	.createReadStream()
    	.pipe(crawler.split());
	}));
```

### .xml(cb)

 Parse XML and stream result.

```js
crawler(/* url */)
  .pipe(crawler.xml());

```

 The callback `cb` allows you to get access to the parser (with the query selection engine):

```js
crawler(/* url */)
  .pipe(crawler.xml(function() {
    this.selectAll('items')
    	.createReadStream()
    	.pipe(crawler.map());
	}));
```

### .csv(options, cb)

 Parse CSV and stream result.

```js
crawler(/* url */)
  .pipe(crawler.csv(null, function(err, doc) {
		//do something on doc
	}));

```

### .unzip()

 Unzip archive and steam entries.

```js
crawler(/* url */)
  .pipe(crawler.unzip())
  .on('entry', function(entry) {
    //entry is a stream
  });

```

### .xls()

 Read and parse xls file. See [sheet](https://github.com/SheetJS) for more details.

```js
crawler(/* url */)
  .pipe(crawler.xls())
  .pipe(crawler.through(function(data) {
    //so something on data
  }));

```


### .xlsx()

 Read and parse xlsx file.

```js
crawler(/* url */)
  .pipe(crawler.xlsx());

```


