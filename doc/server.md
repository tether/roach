# roach server

  > status : [public](#concept)

## Concept

A roach server is basically a set of commands on top of a redis queue. You can queue a job into redis (`add`) and/or start using it (`use`). You can also scan a folder and automatically use the available jobs inside. 

Ideally, you should be able to do everything through the command line or the roach REST API. 

## API

### .add(type, options)

 Add a job key into the roach redis queue and hash options into redis under this key.

```js
roach().add('weather', {
	city: 'calgary'
});
```

 You can add multiple times the same type of job. Every job is identified with a uniq id in the redis queue. 

 The queue is just a simple list of ids:

```
3
4
65
102
```
 and the presence of an id in this list means that roach should process the associate job as soon as possible (see [use](#use)).

### .use(type, job)

 Associate a job with a type. The job will start every time there is an id of same type into the redis queue (see [add](#add)). 

```js
roach()
  .add('weather', {city:'calgary'})
	.use('weather', function(job) {
	  //do something
	})
	.add('weather', {city:'toronto'})
```

 > It doesn't matter if you add a job before or after using it, roach is smart enough to know when to start a job.

### .scan(dir)

 Scan a direcctory and use jobs.

```js
roach().scan(__dirname);
```
