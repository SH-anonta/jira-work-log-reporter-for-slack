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
    const tomorrow = today.clone().add(1, 'day');
    let totalWorkDuration = null

    switch (reportType) {
        case 'today':
            totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(today, tomorrow);
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
        case 'today-issue-changes':
            today.subtract(1, 'day');
            tomorrow.subtract(1, 'day');
            const issues = await jiraService.getIssuesUpdatedOrCreatedBetweenDates(today, tomorrow);
            const issueLinkListItems = issues.map((issue, idx) => `${idx+1}. <${issue.link}|${issue.key}:${issue.title}>`);

            let issueChangesSummary = `<@${mentionUserId}> has updated the following issues today:\n\n`;
            issueChangesSummary += issueLinkListItems.join('\n');

            await slackService.sendMessageToChannel(issueChangesSummary);
            break;
        default:
            throw Error(`Invalid report type: ${reportType}`);
    }
}
