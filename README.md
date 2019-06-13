# Sample JS code

## Instructions
This code provides an algorithm that checks the availabilities of an agenda depending of
the events attached to it. The main method has a start date for input and is looking for
the availabilities of the next 7 days.

They are two kinds of events:
 * `opening`, are the openings for a specific day and they can be recurring week by week.
 * `appointment`, times when the appointment is already booked.


Main entry point is:
```js
function getAvailabilities(date, numberOfDays = 7) {}
```

## How to run
 * Install [node](https://nodejs.org/en/)
 * Run

```bash
	npm install
	npm test
```

## Expected Result for npm test

```bash
 PASS  src/getAvailabilities.test.js
  getAvailabilities
    checks truncated empty response
      ✓ should return empty every day from 10th to 17th (14ms)
    makes appointment after recurring day
      ✓ handles null date (14ms)
      ✓ handles null for openning (5ms)
      ✓ handles null for appointment (5ms)
      ✓ handles invalid Date (5ms)
      ✓ minimum response is 7 days (4ms)
      ✓ handles decimal (5ms)
      ✓ converts string to number (4ms)
      ✓ opens recurring and reserves only one day  (4ms)
    not found
      ✓ returns list of empty availabilities (2ms)
    does not make recurring event
      ✓ returns empty when not found (5ms)
      ✓ no appointment without openning (6ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.145s
Ran all test suites.

Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.

```
