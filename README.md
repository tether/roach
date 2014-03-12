
# roach

  Roach is a crawler queue backend by redis

## Installation

  Install with [nodejs](http://nodejs.org):

    $ npm install roach

  Roach is also a command line:

    $ npm install -g roach

## Test

  Make sure [`redis`](http://redis.io/topics/quickstart) is up and running. Then:

    $ make test

  To test the command line, please create a symlink as following:

    $ sudo npm link

## Documentation

  - [roach](./doc/server.md)
  - [job](./doc/bug.md)
  - [cli](./doc/cli.md)


## License

  The MIT License (MIT)

  Copyright (c) 2014 <Petrofeed Inc>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.