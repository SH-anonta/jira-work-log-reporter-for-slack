require('dotenv').config({ path: '../.env'});
const jiraService = require('./services/jira-service');
const slackService = require('./services/slack-service');
const logger = require("./utility/logger");

reportWorkLogHours().catch(err => {
    logger.error(err);
});

logger.info('Starting work log reporter');

async function  reportWorkLogHours() {
    const mentionUserName = process.env.SLACK_TARGET_USER_NAME;
    const totalWorkDuration = await jiraService.getWorkLogDurationToday();

    await slackService.sendMessageToChannel(`@${mentionUserName} has logged ${totalWorkDuration} hours of work today`);
}
