var app = require('..')();
var client = require('redis').createClient();


//add jobs in queue

//app.transport('rabbit');
app.use('weather', require('./weather'));
app.use('stocks');


//process jobs as soon as possible

app.add('weather', {city:'calgary'});
app.add('stocks');



client.psubscribe("roach:job:*");
client.on("pmessage", function (pattern, channel, message) {
	console.log(pattern, channel, message);
});