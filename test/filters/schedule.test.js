var chai = require('chai'),
    expect = chai.expect,
    path = require('path'),
    date = require('../../utils').date;
    schedule = require('../../lib/filters/schedule.js');

describe("roach.test.filters.schedule", function() {

  it("should return the document if today matches one of the weekdays", function() {
    // SETUP

    var params = {
      date: date('Aug 21, 2013'), //this is a Wednesday
      schedule: {
        daysOfWeek: ['monday', 'tuesday', 'wednesday']
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.be.null;
  });

  it("should return [] if today doesn't match one of the weekdays", function() {
    // SETUP
    var params = {
      date: date('Aug 23, 2013'), //this is a Friday
      schedule: {
        daysOfWeek: ['monday', 'tuesday', 'wednesday']
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return the document if today matches a day for a weekly repeat rule", function() {
    // SETUP
    var params = {
      date: date('Aug 21, 2013'), //this is a Wednesday
      schedule: {
        repeat: {
          duration: 'weeks',
          span: 2,
          days: ['wednesday', 'friday'],
          startDate: 'Jan 9, 2013' // this is a wednesday
        }
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.be.null;
  });

  it("should return [] if today matches a day for a weekly repeat rule", function() {
    // SETUP
    var params = {
      date: date('Aug 22, 2013'), //this is a Thursday
      schedule: {
        repeat: {
          duration: 'weeks',
          span: 2,
          days: ['wednesday', 'friday'],
          startDate: 'Jan 9, 2013' // this is a wednesday
        }
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.deep.equal([]);
  });

  it("should return the document if the duration matches a duration for a weekly repeat rule", function() {
    // SETUP
    var params = {
      date: date('Sept 3, 2013'), //this is a Tuesday
      schedule: {
        repeat: {
          duration: 'weeks',
          span: 2,
          days: ['tuesday', 'friday'],
          startDate: 'Jan 8, 2013' // this is a Tuesday
        }
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.be.null;
  });

  it("should return [] if the duration doesn't match a duration for a an alternating weekly repeat rule", function() {
    // SETUP
    var params = {
      date: date('Sept 4, 2013'), //this is a Wednesday
      schedule: {
        repeat: {
          duration: 'weeks',
          span: 2,
          days: ['tuesday', 'friday'],
          startDate: 'Jan 9, 2013' // this is a wednesday
        }
      }
    };

    // TEST
    var result = schedule( null, params );

    // VERIFY
    expect(result).to.deep.equal([]);
  });
});