var date = require('./date');


/**
 * Expose 'scheduler'
 */
module.exports = scheduler;

function dayOfWeek(day) {
  return day.format('dddd').toLowerCase();
}

/**
 * Compare the current date with the schedule passed in.
 * 
 * @param  {Object} schedule Object with dayOfWeek attribute ({Array}) 
 * @param  {}
 * @return {Boolean}        true if the today matches the schedule.
 */
function scheduler(schedule, today){

  // If no schedule was passed then move along
  if (!schedule) return true;

  today = today || date.today({offset: 'MST'});

  // if the day exists in the schedule we move on
  if (schedule.daysOfWeek && schedule.daysOfWeek.indexOf( today.format('dddd').toLowerCase() ) !== -1 ){
    return true;
  }

  // if today is one of the days that we repeat, move on
  if (schedule.repeat && schedule.repeat.days.indexOf( dayOfWeek(today) ) !== -1 ){

    var startDate = date(schedule.repeat.startDate).setZone('MST').utc();
    var duration = parseInt(date.duration(today.diff( startDate )).asWeeks(), 10);

    if ( duration % schedule.repeat.span === 0 ) {
      return true;
    }
  }

  return false;
};