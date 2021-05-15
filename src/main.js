require('dotenv').config({ path: '../.env'});
const schedule = require('node-schedule');
const jiraService = require('./services/jira-service');
const slackService = require('./services/slack-service');
const logger = require("./utility/logger");

const POST_REPORT_TIME = '0 0 20 * * 1-5';

const scheduledJob = schedule.scheduleJob(POST_REPORT_TIME, function(){
    reportWorkLogHours().catch(err => {
        logger.error(err);
    });
});

logger.info('Scheduled job for reporting work log hours.');

async function  reportWorkLogHours() {
    const mentionUserName = process.env.SLACK_TARGET_USER_NAME;
    const totalWorkDuration = await jiraService.getWorkLogDurationToday();

    await slackService.sendMessageToChannel(`${mentionUserName} has logged ${totalWorkDuration} hours of work today`);
}
