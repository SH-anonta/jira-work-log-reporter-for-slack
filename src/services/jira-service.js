const moment = require('moment');
const axios = require('axios');
const logger = require('../utility/logger');

class JiraService {
    constructor() {
        this.axios = this.createJiraAxiosClient();
    }

    createJiraAxiosClient() {
        const token = process.env.JIRA_ACCESS_TOKEN;
        const email = process.env.JIRA_ACCESS_EMAIL;

        return axios.create({
            baseURL: 'https://practicebynumbers.atlassian.net',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${Buffer.from(
                    `${email}:${token}`
                ).toString('base64')}`
            }
        });
    }

    async getWorkIdsOfWorkLogsUpdatedSince(sinceTime) {
        const updatedWorkLogsResponse = await this.axios.get('/rest/api/3/worklog/updated', {
            params: {
                since: sinceTime.valueOf(),
            }
        });

        return updatedWorkLogsResponse.data.values.map(workLog => workLog.worklogId);
    }

    async getWorkLogsUpdatedToday(sinceTime) {
        const workLogIds = await this.getWorkIdsOfWorkLogsUpdatedSince(sinceTime);

        const response = await this.axios.post('/rest/api/3/worklog/list', {
            ids: workLogIds,
        });

        const workLogs = response.data.map(log => ({
            id: log.id,
            issueId: log.issueId,
            author: log.author,
            started: moment(log.started),
            duration: log.timeSpentSeconds,
        }));

        return workLogs;
    }

    async getWorkLogDurationBetweenDates(startDate, endDate) {
        logger.info('Fetching JIRA logs');

        const targetEmailAddress = process.env.JIRA_TARGET_USER_EMAIL;
        const workLogs = await this.getWorkLogsUpdatedToday(startDate);

        const filteredWorkLogs = workLogs.filter(
            log => log.author.emailAddress === targetEmailAddress
                && log.started.isSameOrAfter(startDate)
                && log.started.isBefore(endDate)
        );

        const totalDurationSeconds = filteredWorkLogs.reduce((accu, current) => accu + current.duration, 0);

        const secondsPerHours = 60 * 60;
        const totalDurationsHours = (totalDurationSeconds / secondsPerHours);

        return totalDurationsHours.toFixed(2);
    }

}

const jiraService = new JiraService();

module.exports = jiraService;
