var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai"),
    expect = chai.expect,
    _ = require('lodash');
    Scheduler = require('../../lib/scheduler'),
    Event = require('events').EventEmitter;

chai.use(sinonChai);

var scheduler = null;
var job = {
  on: sinon.stub(),
  run: sinon.stub()
};

describe("roach.test.lib.scheduler", function() {

  beforeEach(function(){
    scheduler = new Scheduler();
  });

  afterEach(function(){
    scheduler = null;
  });

  describe("schedule", function() {
    it("should add a job to the queue", function(done){

      var name = scheduler.schedule(job);

      // VERIFY
      expect(scheduler._queue.length).to.equal(1);
      expect(scheduler._jobs[name]).to.exist;

      done();
    });

    it("should add a schedule to job that doesn't have one", function(done){

      scheduler.schedule(job);

      var jobs = _.at(scheduler._jobs, 0);

      // VERIFY
      expect(jobs[0].schedule).to.exist;

      done();
    });
  });

  describe("nextJob", function() {
    it("should return the next job", function(done){

      scheduler.schedule(job);
      scheduler.schedule(job);

      // TEST
      var nextJob = scheduler.nextJob();

      expect(nextJob.name).to.equal('job2');

      done();
    });
  });


  describe("currentJob", function() {
    it("should return the current job", function(done){

      scheduler.schedule(job);
      scheduler.schedule(job);

      // TEST
      var currentJob = scheduler.currentJob();

      expect(currentJob.name).to.equal('job1');

      done();
    });
  });

});