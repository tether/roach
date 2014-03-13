# job

  > status : [public]()

## Concept

 A job is a simple and clean API that helps you to communicate with a roach server. It's the entry point of your crawler but it totally independant from it (could potentially be used in client side). Do whatever you want, a job just carries the data and receive commands
 from roach.

 It is inspired by expressjs and its middleware mechanism.

```js
var wells = module.exports = roach.job();
```

 A job is like an expressjs app, it is a sandbox with single responsabilities that you can use or reuse multiple times. 

```js
roach()
  .use(wells)
  .use(rigs)

```

## API

### job()

 Create a new job.

```js
var job = module.exports = roach.job();
```

 It is important to export the job in order to be used by roach.


### .emit(topic) and .on(topic)

 A `job` inherits from an emitter in order to get commands from roach or to send data to it. 

 Emit message.

```js
job.emit('data', data);
```

 Receive messages.

```js
job.on('command', function(cmd) {
  //do something
});
```

 A job can respond to multiple events:
   - `start` start crawling data
   - `stop` stop crawling data

### .config(name, data)

 Set/Get a config attribute. This config will be use by roach to initialize the job.


```js
job.config('name','my crawler');
```

  Emits `change` event with `name, value, previous value`.<br>
  Emits `change name` event with `value, previous value`.

 Or set multuple attributes.

```js
job.config({
  name: 'my crawler',
  type: 'web'
});
```

 Or get a config attribute

```js
job.config('name');
```

  > the config inherits from [store](http://github.com/bredele/store) and is an emitter as well. It is possible to watch changed in the config through the job sandbox (`job.sandbox`)

### .log(str, args...)

 Send log message.

basic:

```js
job.log('this is a log');
```

sprintf-like:

```js
job.log('name %s','roach');
```

array-like:

```js
job.log('name %1 %0','roach', 'jobs');
```
  > In the future, `log` could have priorities in order to display syslog-like messages (warn, error, etc).

### .process(value, total)

 Tells roach how much the job is completed.

```js
job.process(10);
```

or ratio on total:

```js
job.process(13, 120);
```

### .start(fn)

 Execute callback on `start` (one or serveral times).

```js
job.start(function(){
  //do something
});
```

 You can do the same thing with the method `on`:

```js
job.on('start', function() {
  //do something
});
```



