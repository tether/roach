## Roach
Roach is a special web crawling framework and is made up by a bunch of separate components. Below are the components and their responsibility.

* Roach - This is the main entry point and the .It encompasses a server, a scheduler, and a job runner.
* Transports - A transport is a place where data can be sent to
* Jobs - A job that can be run by Roach
* Crawlers - A special type of job that fetches or submits web data
* Filters - Used by a crawler to filter the data returned. Can be chained to be more expressive.

### Using Transports
You can use multiple transports to send your data to in roach. You setup the transports like so:

```js
var Roach = require('roach');
var roach = new Roach();

roach.use('rabbitmq', rabbitmqOptions)
     .use('mongodb', mongodbOptions)
     .use('couchdb', couchdbOptions);

roach.start();
```

By default the output of a job will be sent to **all transports** unless you specify which transports you want to use like so:

```js
  var Roach = require('roach');
  var roach = new Roach();

  roach.schedule(crawler, ['mongodb', 'couchdb']);
```

### Scheduling Jobs
You will need to schedule your jobs to be run. Each job should have a schedule applied to it. If not it will be queued up to be run right away.

```js
var Roach = require('roach');
var roach = new Roach();

roach.schedule(crawler);
```

### Cancelling Jobs
Currently you can only cancel jobs by the job name. However, in the future you should be able to cancel the jobs by date as well.

```js
var Roach = require('roach');
var roach = new Roach();

var scheduledJob = roach.schedule(crawler);

// Actually cancel the job
var isCancelled = roach.cancel(scheduledJob.name);
```

### Getting a Jobs Status
You will need to schedule your jobs to be run 

```js
var Roach = require('roach');
var roach = new Roach();

var scheduledJob = roach.schedule(crawler);

// Get the status
var status = roach.status(scheduledJob.name);
```

### Utils

We provide a few helpful utility libraries wrapped up in the `Roach.Utils` namespace. At the moment they are:

* `Roach.Utils` -> Various little helpful utilities
* `Roach.Utils._` -> [underscore](http://underscorejs.org)
* `Roach.Utils._.str` -> [underscore-string](http://epeli.github.io/underscore.string/)
* `Roach.Utils.date` -> [moment](http://momentjs.com)