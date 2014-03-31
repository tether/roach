var roach = require('..');
var assert = require('assert');
var client = require('redis').createClient();

describe("start job (debug purpose)", function() {

	var master, job;
	beforeEach(function() {
		master = roach();
		job = roach.job();
	});
	
	it('should start job', function(done) {
		job.start(function(){
			done();
		});
		master.use(job);
	});
});

describe("function job:", function() {
	
	var master;
	beforeEach(function() {
		master = roach();
	});

	it('should pass a job to the function', function(done) {
		master.use('something', function(job) {
			job.start(function() {
				done();
			});
		});
		master.add('something');
	});

});


describe("queue pending job", function() {

	var master, job;
	beforeEach(function() {
		master = roach();
		job = roach.job();
	});

	it("should have an add handler", function() {
		assert.equal(typeof master.add, 'function');
	});

	it('should start job if added', function(done) {
		job.start(function() {
			done();
		});
		master.add('traffic');
		master.use('traffic', job);
	});

	it('should start job on add', function(done) {
		job.start(function() {
			done();
		});
		master.use('weather', job);
		master.add('weather');
	});
	
});


describe('queue active job', function() {

	var master, job;
	beforeEach(function() {
		master = roach();
		job = roach.job();
	});

	it('should add job id in active job when started', function(done) {
		job.start(function(id) {
			client.lindex('roach:jobs:active', id, function(err, res) {
				if(res) done();
			});
		});
		master.use('video', job);
		master.add('video');
	});

	it('should not start a job if already processed', function() {
		var rss = roach.job();
		var processed = false;
		job.start(function() {
			console.log('start job');
		});
		rss.start(function() {
			console.log('start rss');
			processed = true;
		});
		master.use('rss', job);
		master.use('rss', rss);
		master.add('rss');
	});

});



