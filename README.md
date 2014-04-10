# roach

  Roach is a crawler queue backend by redis

## Installation

  Install with [nodejs](http://nodejs.org):

    $ npm install roach

  Roach is also a command line:

    $ npm install -g roach

## Test

  Make sure [`redis`](http://redis.io/topics/quickstart) is up and running. Then:

    $ npm test

  Flush redis database:

    $ npm run flush


  To test the command line, please create a symlink as following:

    $ sudo npm link

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


## License

Proprietary
