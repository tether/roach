var app = require('..')(),
		client = require('redis').createClient();


app.scan(__dirname);


client.psubscribe("roach:job:*");
client.on("pmessage", function (pattern, channel, message) {
	console.log(channel, message);
});

setTimeout(function() {
	app.add('weather', {city:'calgary'});
	app.add('stocks');
}, 100);