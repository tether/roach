## Filters
Filters are used to, wait for it... filter data. They are chainable and have the same context so you can pass data along by  attaching it to `this`.

A typical filter looks like this:

```js
// Require any dependencies

module.exports = function(next){
  return function(options) {
    this.links = _.map( $(options.selector, document), function(element){
      return element.attribs.href;
    });

    next();
  };
};
```

### Error Handling
If you next an error then it will skip the rest of the filters in the chain.

```js
// Require any dependencies

module.exports = function(next){
  return function(options) {
    // Some error happened.

    next(new Error('Boo! An Error.'));
  };
};
```