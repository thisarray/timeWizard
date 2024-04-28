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
     * Return the integer number of days between date1 and date2.
     */
    getDaysApart(date1, date2) {
      if (!(date1 instanceof Date)) {
        throw new TypeError('date1 must be a Date object.');
      }
      if (!(date2 instanceof Date)) {
        date2 = new Date();
      }
      return Math.floor((date2.getTime() - date1.getTime()) / ONE_DAY);
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
     * Parse the datetime attribute of the time tag element.
     */
    parseDatetime(element) {
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

      return date;
    },

    test() {
      console.assert(timeWizard.count('foobar', 'a') === 1,
                     {msg: 'count() failed.'});
      console.assert(timeWizard.count('foobar', 'b') === 1,
                     {msg: 'count() failed.'});
      console.assert(timeWizard.count('foobar', 'c') === 0,
                     {msg: 'count() failed.'});
      console.assert(timeWizard.count('foobar', 'o') === 2,
                     {msg: 'count() failed.'});
      console.assert(timeWizard.count('foobar', '') === 0,
                     {msg: 'count() failed.'});
      console.assert(timeWizard.count('foobar', 'foo') === 0,
                     {msg: 'count() failed.'});

      console.assert(timeWizard.getDaysApart(new Date()) === 0,
                     {msg: 'getDaysApart() failed.'});
      for (let i = 0; i < 29; i++) {
        console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 2, 3 + i)) === i,
                       {msg: 'getDaysApart() failed.'});
      }
      // month is 0-indexed so this is the number of days between March 3 and April 3
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 3, 3)) === 31,
                     {msg: 'getDaysApart() failed.'});
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 3, 4)) === 32,
                     {msg: 'getDaysApart() failed.'});
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 4, 3)) === 61,
                     {msg: 'getDaysApart() failed.'});
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 4, 6)) === 64,
                     {msg: 'getDaysApart() failed.'});
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2022, 2, 3)) === 365,
                     {msg: 'getDaysApart() failed.'});

      console.assert(timeWizard.getWeek(1970, 1).toISOString().substring(0, 10) === '1969-12-29',
                     {msg: 'getWeek() failed.'});
    },

    main() {
      for (const element of document.querySelectorAll('time')) {
        let date = timeWizard.parseDatetime(element),
            result, title;
        if (date instanceof Date) {
          result = date.toISOString();

          // Set the title attribute of the time tag
          title = element.getAttribute('title');
          if ((title == null) || (title === '')) {
            element.setAttribute('title', result);
          }

          // Append to the text of the time tag
          element.textContent += ' (' + result + ')';
        }
      }
    }
  }
})();
