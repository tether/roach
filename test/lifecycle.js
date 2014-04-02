var roach = require('..');
var assert = require('assert');
var client = require('redis').createClient();

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

			it('send progress and log events', function() {

			});

		});

		describe('finished', function() {

			it('is removed from active queue', function() {
				
			});

		});
		
	});
	
});
