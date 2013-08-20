var date = require('../../utils').date,
	_ = require('../../utils')._;


function dayOfWeek(day) {
	return day.format('dddd').toLowerCase();
}

// Compare today to the schedule passed in, continue if today matches the schedule
// otherwise exit gracefully
module.exports = function(document, params){
	params = params || {};
	var schedule = params.schedule;

	// If no schedule was passed then move along
	if (!schedule) return document;

	var today = params.date || date.today({offset: 'MST'});

	// if the day exists in the schedule we move on
	if (schedule.daysOfWeek && schedule.daysOfWeek.indexOf( today.format('dddd').toLowerCase() ) !== -1 ){
		return document;
	}

	// console.log('today', today.format(), dayOfWeek(today));
	// if today is one of the days that we repeat, move on
	if (schedule.repeat && schedule.repeat.days.indexOf( dayOfWeek(today) ) !== -1 ){

		var startDate = date(schedule.repeat.startDate).setZone('MST').utc();
		var duration = parseInt(date.duration(today.diff( startDate )).asWeeks(), 10);

		if ( duration % schedule.repeat.span === 0 ) {
			return document;
		}
	}

	// TODO (EK): We would like to actually emit an error or something
	// here but until we have chainable filters its not viable
	return [];
};