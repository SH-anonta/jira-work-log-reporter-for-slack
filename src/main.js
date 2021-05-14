require('dotenv').config({ path: '../.env'});
const jiraService = require('./services/jira-service');

async function  doWork() {
    try {
        const totalWorkDuration = await jiraService.getWorkLogDurationToday();

        console.log('work duration', totalWorkDuration);
    } catch(e) {
        console.error(e);
    }
}

doWork();