var app = require('..')(),
		spawn = require("child_process").fork,
		client = require('redis').createClient();


console.log(process.title);

//app.scan(__dirname);

//fork doesn't work, why?
// var proc = spawn('./stocks');

app.use('weather', require('./weather'));
app.use('stocks');

client.psubscribe("roach:job:*");
client.on("pmessage", function (pattern, channel, message) {
	console.log(pattern, channel, message);
});

setTimeout(function() {
	app.add('weather', {city:'calgary'});
	app.add('stocks');
}, 100);


