# bug

  A roach bug is a scheduled job.

## Concept

 A bug is a simple and clean API that helps you to communicate with a roach server. It's the entry point of your crawler but it totally independant from it. Do whatever you want, a bug is just carry the data and receive commands
 from roach.

 It is inspired by expressjs and its middleware mechanism.

```js
var wells = module.exports = roach.bug();
```

 A bug is like an expressjs app, it is a sandbox with single responsabilities that you can use or reuse multiple times. 

```js
roach(__dirname)
  .use(wells)
  .use(rigs)
```

## API

### bug()

 Create a new job.

```js
var bug = module.exports = roach.bug();
```

 It is important to export the job in order to be used by roach.


### .emit(topic) and .on(topic)

 A `bug` inherits from an emitter in order to get commands from roach or to send data to it. 

 Emit message.

```js
bug.emit('data', data);
```

 Receive messages.

```js
bug.on('command', function(cmd) {
	//do something
});
```

 A bug can respond to multiple events:
   - `start` start crawling data
   - `stop` stop crawling data

### .config(name, data)

 Set/Get a config attribute. This config will be use by roach to initialize the job.


```js
bug.config('name','my crawler');
```

  Emits `change` event with `name, value, previous value`.<br>
  Emits `change name` event with `value, previous value`.

 Or set multuple attributes.

```js
bug.config({
  name: 'my crawler',
  type: 'web'
});
```

 Or get a config attribute

```js
bug.config('name');
```

  > the config inherits from [store](http://github.com/bredele/store) and is an emitter as well. It is possible to watch changed in the config through the bug sandbox (`bug.sandbox`)