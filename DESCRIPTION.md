> We want to revamp our crawler system.

# Phase 1

## Requirements
- A simple server with a CLI to schedule jobs
- The server and scheduler should be deployable somewhere (ideally Heroku)
- A job scheduler should be based off of [later](http://bunkat.github.io/later/) and [moment](http://momentjs.com/).
- Scheduler needs to be queue based. I would suggest Redis. Also use [kue](https://github.com/learnboost/kue) for inspiration.
- Don't worry about complex schedules, delays, retries, etc. For first cut just be able to schedule crawlers immediately.
- Each *crawler* can be scheduled to be run as a *job*. They are separate files. A typical crawler bundle would look like so:
  
  ```
    crawlers
      -> example_crawler
        -> roach.json
        -> crawler.js
        -> steps
          -> custom-step1.js
          -> custom-step2.js
  ```
  - `roach.json` - A manifest file defining the default crawler options.
  - `crawler.js` - The actual crawler file that defines the order of the steps.
  - `steps` - A directory containing any custom steps that are required.
- Crawlers are written like so (look into [casperjs](http://casperjs.corg)).

```js
var Crawler = require('crawler');

Crawler.extend({
  // Your extra custom functions for parsing, etc.
  custom: function(params, data, next){
    // do some custom stuff with the data
    next(data);
  }
});

Crawler.visit(this.url)
       .custom()
       .find('a.link')
       .each()
       .click()
       .done();
```
- Crawlers are put in a `crawlers` directory.
- When a scheduled crawler (job) is finished running the data should be sent to rabbitMQ.
- It should handle the following document formats:
    - XML
    - JSON
    - Text
    - CSV
    - XLS, XLSX
    - ZIP files

# Phase 2

## Requirements
- Add a REST API to schedule jobs (see API spec)
- Have the server watch the `crawlers` directory for changes. All crawlers in the `crawlers` directory should be available to schedule via `POST /job` and view via `GET /crawlers`.
- Add support for more complex schedules, delays, and retry rules.
- Begin to add more transports (logger, mongodb, disk) that can be saved to.
- Support PDF parsing (either a NodeJS one or use the ruby parser)

# Phase 3

## Requirements
- Add a basic web UI to be able to schedule crawlers and see current status
- Add support for sending files to be crawled via ftp, http, and email.
- Add support for dropbox transport
- Add email notification system for failure

# Phase 4

## Requirements
- Add the ability to upload a file through the web UI and get a crawler to run against it.
- Add ability to upload crawler code through the web UI
- Add slack integration for failures/successful runs