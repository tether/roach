var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    date = require('../../utils').date;
    schedule = require('../../utils/schedule.js');

describe("roach.test.utils.schedule", function() {

  it("should return true if today matches one of the weekdays", function() {
    // SETUP

    var day = date('Aug 21, 2013').setZone('MST'); //this is a Wednesday
    var sched = {
      daysOfWeek: ['monday', 'tuesday', 'wednesday']
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.true;
  });

  it("should return false if today doesn't match one of the weekdays", function() {
    // SETUP
    var day = date('Aug 23, 2013').setZone('MST'); //this is a Friday
    var sched = {
      daysOfWeek: ['monday', 'tuesday', 'wednesday']
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.false;
  });

  it("should return true if today matches a day for a weekly repeat rule", function() {
    // SETUP
    var day = date('Aug 21, 2013').setZone('MST'); //this is a Wednesday
    var sched = {
      repeat: {
        duration: 'weeks',
        span: 2,
        days: ['wednesday', 'friday'],
        startDate: 'Jan 9, 2013' // this is a wednesday
      }
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.true;
  });

  it("should return false if today matches a day for a weekly repeat rule", function() {
    // SETUP
    var day = date('Aug 22, 2013').setZone('MST'); //this is a Thursday
    var sched = {
      repeat: {
        duration: 'weeks',
        span: 2,
        days: ['wednesday', 'friday'],
        startDate: 'Jan 9, 2013' // this is a wednesday
      }
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.false;
  });

  it("should return true if the duration matches a duration for a weekly repeat rule", function() {
    // SETUP
    var day = date('Sept 3, 2013').setZone('MST'); //this is a Tuesday
    var sched = {
      repeat: {
        duration: 'weeks',
        span: 2,
        days: ['tuesday', 'friday'],
        startDate: 'Jan 8, 2013' // this is a tuesday
      }
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.true;
  });

  it("should return false if the duration doesn't match a duration for a an alternating weekly repeat rule", function() {
    // SETUP
    var day = date('Sept 4, 2013').setZone('MST'); //this is a Wednesday
    var sched = {
      repeat: {
        duration: 'weeks',
        span: 2,
        days: ['tuesday', 'friday'],
        startDate: 'Jan 9, 2013' // this is a wednesday
      }
    };

    // TEST
    var result = schedule( sched, day );

    // VERIFY
    expect(result).to.be.false;
  });
});