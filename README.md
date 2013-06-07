# Roach

> A very adaptable web crawler framework. Impossible to kill.

![Roach](roach_medium.png)

## Getting Started

1. Install the module via npm:
  
```
npm install roach
```

## Usage

### Basic

```js
var Roach = require('roach');

var roach = new Roach();

// Use multiple transports with default options
roach.use('logger').use('mongodb');

// Add a job to get all the 'a' links from google.com
roach.addJob( 'http://google.com', 'google' ).filter( 'links' );

// run the job
roach.run();
```

## License

**Creative Commons 3.0 - Attribution Sharealike**

You can remix, copy or use for both commercial and non-commercial products and services but you need to provide attribution for the original work in the source code to *"PetroFeed Inc."*. You must also share the original or any derivative under the same license. A description of the license can be found [here](http://creativecommons.org/licenses/by-sa/3.0).