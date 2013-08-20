var chai = require('chai');
var expect = chai.expect;
var date = require('../../utils/date.js');

describe("roach.test.utils.date", function() {
  it("should have a day attribute in seconds", function() {
    expect(date.day).to.equal(86400);
  });

  it("should have an hour attribute in seconds", function() {
    expect(date.hour).to.equal(3600);
  });

  it("should have a minute attribute in seconds", function() {
    expect(date.minute).to.equal(60);
  });

  describe("today", function() {
    it("should return today's date in UTC when no options are passed", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(0).seconds(0).milliseconds(0).utc();

      // TEST
      var result = date.today();

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });

    it("should return today's date in UTC with the proper timezone when the offset is passed in", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(0).seconds(0).milliseconds(0).setZone('PST').utc();

      // TEST
      var result = date.today({
        offset: 'PST'
      });

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });

    it("should return today's date in UTC when hours are passed in", function() {
      // SETUP
      var expectedTime = date().hours(2).minutes(0).seconds(0).milliseconds(0).utc();

      // TEST
      var result = date.today({
        hours: 2
      });

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });

    it("should return today's date in UTC when minutes are passed in", function() {
      // SETUP
      var expectedTime = date().hours(2).minutes(34).seconds(0).milliseconds(0).utc();

      // TEST
      var result = date.today({
        hours: 2,
        minutes: 34
      });

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });

    it("should return today's date in UTC when seconds are passed in", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(0).seconds(29).milliseconds(0).utc();

      // TEST
      var result = date.today({
        seconds: 29
      });

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });

    it("should return today's date in UTC when milliseconds are passed in", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(12).seconds(0).milliseconds(2).utc();

      // TEST
      var result = date.today({
        minutes: 12,
        milliseconds: 2
      });

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });
  });

  describe("tomorrow", function() {
    it("should return tomorrow's date in UTC", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(0).seconds(0).milliseconds(0).add('days', 1).utc();

      // TEST
      var result = date.tomorrow();

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });
  });

  describe("yesterday", function() {
    it("should return yesterday's date in UTC", function() {
      // SETUP
      var expectedTime = date().hours(0).minutes(0).seconds(0).milliseconds(0).subtract('days', 1).utc();

      // TEST
      var result = date.yesterday();

      // VERIFY
      expect(result.getTime()).to.equal(expectedTime.getTime());
    });
  });

  describe("isWeekend", function() {
    it("should return true if date is weekend", function(){
      // SETUP
      // TEST
      var result = date.isWeekend(date('January 5, 2013'));

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return false if date is not a weekend", function(){
      // SETUP
      // TEST
      var result = date.isWeekend(date('January 8, 2013'));

      // VERIFY
      expect(result).to.be.false;
    });
  });

  describe("isWeekday", function() {
    it("should return true if date is weekday", function(){
      // SETUP
      // TEST
      var result = date.isWeekday(date('January 8, 2013'));

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return false if date is not a weekday", function(){
      // SETUP
      // TEST
      var result = date.isWeekday(date('January 5, 2013'));

      // VERIFY
      expect(result).to.be.false;
    });
  });

  // describe("setZone", function() {
  //   it("should return a moment with the correct timezone set", function(){
  //     // SETUP
  //     var day = 'May 27, 2013';
  //     var expectedTime = '2013-05-27T00:00:00-06:00';

  //     // console.log(new Date(day), new Date('2013-05-27T06:00:00+00:00'))
  //     // TEST
  //     var result = date(day).setZone('MST').format();

  //     // VERIFY
  //     expect(result).to.equal(expectedTime);
  //   });
  // });
});