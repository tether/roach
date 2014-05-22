# Roach

 > A very adaptable web crawler framework. Impossible to kill.

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


To test the CLI locally, please create a symlink as follows:

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
  - [job](./doc/job.md)
  - [crawler](./doc/crawler.md)  
  - [cli](./doc/cli.md)
  - [transports](./doc/transports.md)


## License

**Creative Commons 3.0 - Attribution Sharealike**

You can remix, copy or use for both commercial and non-commercial products and services but you need to provide attribution for the original work in the source code to *"PetroFeed Inc."*. You must also share the original or any derivative under the same license. A description of the license can be found [here](http://creativecommons.org/licenses/by-sa/3.0).

---

Proudly brought to you by [PetroFeed](http://PetroFeed.com).


![Pedro](https://www.petrofeed.com/img/company/pedro.png)
