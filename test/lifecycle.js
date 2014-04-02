var roach = require('..');
var assert = require('assert');
var client = require('redis').createClient();

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
			server.add('job', job);
		});

		describe('pending > ', function() {

			it('is added in the pending queue', function(done) {
				var check = function(id) {
					client.zrank('roach:jobs:pending', id, function(err) {
						if(!err) done();
					});
				};
				queue.on('added job', check);
			});

		});

		describe('active', function() {

			it('is added in active queue on start', function() {
				
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
