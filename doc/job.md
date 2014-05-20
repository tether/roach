# Roach Jobs

  > status : [public](#concept)

## Concept

A job is a simple and clean API that helps you to communicate with a roach server. It's the entry point of your crawler but it totally independant from it (could potentially be used in client side). Do whatever you want, a job just carries the data and receive or send commands to redis.

It is inspired by expressjs and its middleware mechanism.

```js
var wells = module.exports = roach.job();
```

A job is like an expressjs app, it is a sandbox with single responsabilities that you can use or reuse multiple times. 

```js
roach()
  .use('wells',wells)
  .use('licenses', wells)
  .use('rigs',rigs)

```

## API

### job()

Create a new job.

```js
var job = module.exports = roach.job();
```

It is important to export the job in order to be used by roach. However, a job can run in a separate process and communicate with a roach server.

```js
var separate = roach.job();
//subscribe to roach events as 'myjob'
separate.subscribe('myjob');
```

**Note:** a job has to subscribe to roach events if it is running on a separate process. See [example](https://github.com/PetroFeed/roach2/blob/master/example/stocks).

### .emit(topic) and .on(topic)

A `job` inherits from an emitter. 

Emit message.

```js
//send message inside the job
job.emit('data', data);
```

 Receive messages.

```js
job.on('data', function(cmd) {
  //do something
});
```

It is only through the private topic `_publish` that you can send commands to redis (some handlers such as `progress`, `log` or `stop` use it). 

```js
//send command to redis
job.emit('_publish', 'something');
```

All the `_publish` commands are queued until the job is initialized by roach and get an id (on start). This way a job is impossible to kill/break and can start processing stuff even before getting started by roach.

### .config(name, data)

Set/Get a config attribute.


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
In the future, `log` may have priorities in order to display syslog-like messages (warn, error, etc).

  > pubsub pattern is `roach:job:$id` 

### .progress(value, total)

Tells roach how much of the job is completed.

```js
job.progress(10);
```

or ratio on total:

```js
job.progress(13, 120);
```

  > pubsub pattern is `roach:job:$id` 

### .data(smthg)

Publish data to redis through the private `_data` command. Data are published only if the job is identified by roach (has an id).

```js
job.data('something');
```
  > pubsub pattern is `roach:job:$id:data` 

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

### .stop()

Send `stop` command to roach.

```js
job.stop(); //hammer time
```

  > pubsub pattern is `roach:job:$id` 