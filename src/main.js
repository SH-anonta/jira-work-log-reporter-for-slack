require('dotenv').config({ path: '../.env'});
const moment = require('moment');
const jiraService = require('./services/jira-service');
const slackService = require('./services/slack-service');
const logger = require("./utility/logger");
const args = require("args-parser")(process.argv)


reportWorkLogHours().catch(err => {
    console.error(err);
    logger.error(err);
});

logger.info('Starting work log reporter');

async function  reportWorkLogHours() {
    const reportType = args['report-type'];
    const mentionUserId = process.env.SLACK_TARGET_USER_MEMBER_ID;

    const today = moment().startOf('day');
    let totalWorkDuration = null

    switch (reportType) {
        case 'today':
            totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(today);
            await slackService.sendMessageToChannel(`<@${mentionUserId}> has logged ${totalWorkDuration} hours of work today.`);
            break;
        case 'yesterday':
            const yesterday = today.clone().subtract(1, 'day');
            totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(yesterday, today);

            await slackService.sendMessageToChannel(`<@${mentionUserId}> logged ${totalWorkDuration} hours of work yesterday.`);
            break;
        case 'current-week':
            const startOfWeek = today.clone().startOf('week').add(1, 'day');
            const endOfWeek = today.clone().endOf('week');
            totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(startOfWeek, endOfWeek);

            await slackService.sendMessageToChannel(`<@${mentionUserId}> has logged ${totalWorkDuration} hours of work this week.`);
            break;
        default:
            throw Error(`Invalid report type: ${reportType}`);
    }
}
