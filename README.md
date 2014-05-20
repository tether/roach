# Roach

  Roach is a web crawling system with a job queue backed by redis. It allows you to write web crawlers, schedule those crawlers, and send the output to multiple locations ([transports](./doc/transports.md)).

## Installation

  Install with [nodejs](http://nodejs.org):

    $ npm install roach

  Roach is also has a [CLI](./doc/cli.md). To use it:

    $ npm install -g roach

## Test

  Make sure [`redis`](http://redis.io/topics/quickstart) is up and running. Then:

    $ npm test

  Flush redis database:

    $ npm run flush


  To test the command line, please create a symlink as following:

    $ sudo npm link


## Example

```
npm run example
```
 
 The example is located in `example` and run the job `stocks` in a separate process. It uses rabbitmq as a transport layer.


## Debug mode

  You can run a roach server in debug mode as following:

```
DEBUG=* node server.js 
```

## Documentation

  - [roach](./doc/server.md)
  - [job](./doc/bug.md)
  - [crawler](./doc/crawler.md)  
  - [cli](./doc/cli.md)
  - [transports](./doc/transports.md)


## License

Proprietary
