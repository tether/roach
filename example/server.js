var app = require('..')({ server: true });
var client = require('redis').createClient();


//add jobs in queue

app.add('weather', {city:'calgary'});
app.add('stocks');


//process jobs as soon as possible


app.transport('rabbit');
app.transport('logger');
app.use('weather', require('./weather'));
app.use('stocks');
