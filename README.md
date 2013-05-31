# Roach

> A very adaptable web crawler framework. Impossible to kill.

![Roach](roach_medium.png)

## Getting Started

1. Install the module via npm:
  
```
npm install roach
```

## Usage

```js
var Roach = require('roach');
var Job = require('roach').Job;

var crawler = new Roach();

crawler.use('mongo', { db: 'crawler' })
       .use('rabbitmq')
       .use('logger')
       .then(runJob);

function runJob( crawler ){

    var job = new Job();

    job.filter(filter1).filter(cancellationBlock);

    crawler.run(job);
}
```
