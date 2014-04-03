var roach = require('..');
var assert = require('assert');
var redis = require('redis');
var client = redis.createClient();

function check(db, id, done) {
	client.zrank(db, id, function(err, res) {
		if(!err) done();
	});
}

//verbose tests
describe('Lifecycle > ', function() {

	var server, queue;
	beforeEach(function() {
		server = roach();
		queue = server.queue;
	});
	

	describe('job', function() {

		var job;
		beforeEach(function() {
			job = roach.job();
			server.add('job');
		});

		describe('pending > ', function() {

			it('is added in the pending queue', function(done) {
				queue.on('added job', function(id) {
					check('roach:jobs:pending', id, done);
				});
			});

		});

		describe('active', function() {

			var crawler;
			beforeEach(function() {
				crawler = roach.job();
				server.add('crawler');
			});
			

			it('is added in active queue and removed from pending on start', function(done) {
				job.start(function(id) {
					check('roach:jobs:active', id, function() {
						client.zrank('roach:jobs:pending', id, function(err, res) {
							if(!err && !res) done();
						});
					});
				});
				server.use('job', job);
			});

			it('send progress and/or log events', function(done) {
				var client = redis.createClient();
				client.psubscribe('roach:job:*');
				client.on('pmessage', function(pattern, channel, msg) {
					console.log('PMESSAGE', channel);
					var target = channel.split(' ');
					if(target[1] === 'crawler' ) {
						if(msg === 'progress 10') done();
					}
					client.punsubscribe('roach:job::*');
				});
				crawler.start(function() {
					crawler.progress(10, 100);
				});
				server.use('crawler', crawler);
			});

		});

		describe('finished', function() {

			var crawler;
			beforeEach(function() {
				crawler = roach.job();
				server.add('search');
			});

			it('is removed from active queue', function() {
				crawler.start(function() {
					crawler.stop();
				});
				server.use('search', crawler);
			});

		});
		
	});
	
});
