# cli

  A command line interface to run a roach server, create or scheduled jobs.

## Help

Install cli:

    $ npm install -g roach


## Create

 Create a roach bug.

```
Usage: roach create [<dir>]

Examples:

  # create a bug:
  $ roach create name
  
```

 > alias : `roach-create`


  It generates the following directory tree:

```
dir_name
  -> roach.json
  -> index.js
    -> steps
```

## Run

 Scan folder (looking for jobs) and start roach server:

```
Usage: roach run

Examples:

  # run roach server:
  $ roach run
  
```

 > alias : `roach-run`
