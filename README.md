# Introduction
This is a simple program that gets the logged work hours of a user in JIRA and posts it on a Slack channel at a specified time for every weekday.

## Report Types
1. `today` Total hours logged today
2. `yesterday` Total hours logged yesterday2.
3. `current-week` Total hours logged in current week
4. `today-issue-changes` List of issues that were created or updated today

## Setup Guide
1. Create a `.env` file based on `.env.simple`
2. Run `main.js` with the `report-type` option. E.g. `node main.js report-type=today` will post today's report
3. Use a task scheduler to execute these commands when you need them
