const timeWizard = (function () {
  /*
   * Integer number of milliseconds in one day.
   */
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return {
    /*
     * Return the integer number of times query appears in str.
     */
    count(str, query) {
      let count = 0;
      for (const c of str) {
        if (c === query) {
          count++;
        }
      }
      return count;
    },

    /*
     * Return the Monday for week weekNumber in year.
     */
    getWeek(year, weekNumber) {
      if (typeof year !== 'number') {
        throw new TypeError('year must be a positive number.');
      }
      if (typeof weekNumber !== 'number') {
        throw new TypeError('weekNumber must be a positive number.');
      }

      let date = new Date(year, 0, 1);
      while (date.getDay() !== 1) {
        // Go back a day until we hit a Monday
        date = new Date(date.getTime() - ONE_DAY);
        // Reset the time to midnight
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      if (weekNumber > 0) {
        date = new Date(date.getTime() + ((weekNumber - 1) * 7 * ONE_DAY));
        // Reset the time to midnight
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      return date;
    },

    /*
     * Process the time tag element.
     */
    processTag(element) {
      let value = element.getAttribute('datetime'),
          hyphenCount = timeWizard.count(value, '-'),
          weekIndex = value.indexOf('-W'),
          date = new Date();

      if (value.startsWith('PT')) {
        // datetime is a duration
        return null;
      }
      else if ((hyphenCount <= 0) && value.includes(':')) {
        // datetime is time only so prepend today's date
        date = new Date(date.toISOString().substring(0, 11) + value);
      }
      else if (hyphenCount === 1) {
        if (weekIndex > 0) {
          // datetime is a week
          let year = parseInt(value.substring(0, weekIndex), 10),
              weekNumber = parseInt(value.substring(weekIndex + 2), 10);
          date = timeWizard.getWeek(year, weekNumber);
        }
        else if (value.startsWith('20')) {
          // datetime is a year-month
          date = new Date(value);
        }
        else {
          // datetime is a month-date so prepend today's year
          date = new Date(date.toISOString().substring(0, 5) + value);
        }
      }
      else {
        date = new Date(value);
      }

      element.textContent += ' (' + date.toISOString() + ')';
    },

    main() {
      for (const element of document.querySelectorAll('time')) {
        timeWizard.processTag(element);
      }
    }
  }
})();
