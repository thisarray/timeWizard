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
      // Reset to midnight UTC to avoid time zone offset issues
      date1 = new Date(date1.toISOString().substring(0, 10));
      date2 = new Date(date2.toISOString().substring(0, 10));
      return Math.floor((date2.getTime() - date1.getTime()) / ONE_DAY);
    },

    /*
     * Return a string description for the number of days in dayCount.
     */
    getDescription(dayCount) {
      dayCount = Math.abs(dayCount);
      if (dayCount < 1) {
        return 'today';
      }
      if (dayCount < 2) {
        return dayCount + ' day';
      }
      if (dayCount < 7) {
        return dayCount + ' days';
      }
      if (dayCount < 14) {
        return Math.floor(dayCount / 7) + ' week';
      }
      if (dayCount < 30) {
        return Math.floor(dayCount / 7) + ' weeks';
      }
      if (dayCount < 60) {
        return Math.floor(dayCount / 30) + ' month';
      }
      if (dayCount < 365) {
        return Math.floor(dayCount / 30) + ' months';
      }
      if (dayCount < 730) {
        return Math.floor(dayCount / 365) + ' year';
      }
      return Math.floor(dayCount / 365) + ' years';
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
      for (let i = 0; i < 28; i++) {
        console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 2, 3 + i)) === i,
                       {msg: 'getDaysApart() failed.'});
        // month is 0-indexed so this is the number of days between March 3 and April 3
        console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 3, 3 + i)) === (31 + i),
                       {msg: 'getDaysApart() failed.'});
        console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2021, 4, 3 + i)) === (61 + i),
                       {msg: 'getDaysApart() failed.'});
        console.assert(timeWizard.getDaysApart(new Date(2021, 8, 3), new Date(2021, 9, 3 + i)) === (30 + i),
                       {msg: 'getDaysApart() failed.'});
        console.assert(timeWizard.getDaysApart(new Date(2021, 8, 3), new Date(2021, 10, 3 + i)) === (61 + i),
                       {msg: 'getDaysApart() failed.'});
      }
      console.assert(timeWizard.getDaysApart(new Date(2021, 2, 3), new Date(2022, 2, 3)) === 365,
                     {msg: 'getDaysApart() failed.'});

      console.assert(timeWizard.getDescription(0) === 'today',
                     {msg: 'getDescription() failed.'});
      console.assert(timeWizard.getDescription(-1) === '1 day',
                     {msg: 'getDescription() failed.'});
      console.assert(timeWizard.getDescription(1) === '1 day',
                     {msg: 'getDescription() failed.'});
      for (let i = 2; i < 7; i++) {
        console.assert(timeWizard.getDescription(i) === i + ' days',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === i + ' days',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 7; i < 14; i++) {
        console.assert(timeWizard.getDescription(i) === '1 week',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === '1 week',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 14; i < 30; i++) {
        console.assert(timeWizard.getDescription(i) === Math.floor(i / 7) + ' weeks',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === Math.floor(i / 7) + ' weeks',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 30; i < 60; i++) {
        console.assert(timeWizard.getDescription(i) === '1 month',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === '1 month',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 60; i < 365; i++) {
        console.assert(timeWizard.getDescription(i) === Math.floor(i / 30) + ' months',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === Math.floor(i / 30) + ' months',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 365; i < 730; i++) {
        console.assert(timeWizard.getDescription(i) === '1 year',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === '1 year',
                       {msg: 'getDescription() failed.'});
      }
      for (let i = 730; i < 1000; i++) {
        console.assert(timeWizard.getDescription(i) === Math.floor(i / 365) + ' years',
                       {msg: 'getDescription() failed.'});
        console.assert(timeWizard.getDescription(-i) === Math.floor(i / 365) + ' years',
                       {msg: 'getDescription() failed.'});
      }

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
