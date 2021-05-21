const moment = require('moment');
const jiraService = require('./jira-service');
const slackService = require('./slack-service');

class ReportService {
    constructor() {
        this.mentionUserId = process.env.SLACK_TARGET_USER_MEMBER_ID;
    }

    async sendTodayWorkLogsReport() {
        const today = moment().startOf('day');
        const tomorrow = today.clone().add(1, 'day');

        const totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(today, tomorrow);

        await slackService.sendMessageToChannel(`<@${this.mentionUserId}> has logged ${totalWorkDuration} hours of work today.`);
    }

    async sendYesterdayWorkLogsReport() {
        const today = moment().startOf('day');
        const yesterday = today.clone().subtract(1, 'day');

        const totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(yesterday, today);

        await slackService.sendMessageToChannel(`<@${this.mentionUserId}> logged ${totalWorkDuration} hours of work yesterday.`);
    }

    async sendCurrentWeekWorkLogsReport() {
        const today = moment().startOf('day');
        const startOfWeek = today.clone().startOf('week').add(1, 'day');
        const endOfWeek = today.clone().endOf('week');

        const totalWorkDuration = await jiraService.getWorkLogDurationBetweenDates(startOfWeek, endOfWeek);

        await slackService.sendMessageToChannel(`<@${this.mentionUserId}> has logged ${totalWorkDuration} hours of work this week.`);
    }

    async todayIssueUpdatesSummaryReport() {
        const today = moment().startOf('day');
        const tomorrow = today.clone().add(1, 'day');

        const issues = await jiraService.getIssuesUpdatedOrCreatedBetweenDates(today, tomorrow);

        const issueLinkListItems = issues.map((issue, idx) => `${idx+1}. <${issue.link}|${issue.key}:${issue.title}>`);
        let issueChangesSummary = `<@${this.mentionUserId}> has updated the following issues today:\n\n`;
        issueChangesSummary += issueLinkListItems.join('\n');

        if (issues.length < 1) {
            issueChangesSummary = `<@${this.mentionUserId}> did not update any issue today`;
        }

        await slackService.sendMessageToChannel(issueChangesSummary);
    }
}

const reportService = new ReportService();

module.exports = reportService;
