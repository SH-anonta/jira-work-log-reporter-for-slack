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
            baseURL: process.env.JIRA_DOMAIN,
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

    async jqlSearchIssues(query) {
        const response = await this.axios.post('/rest/api/3/search', {
            jql: query,
        });

        return response.data;
    }

    async getIssuesUpdatedOrCreatedBetweenDates(startDate, endDate) {
        const DATE_FORMAT = 'YYYY-MM-DD';
        const startDateStr = startDate.format(DATE_FORMAT);
        const endDateStr = endDate.format(DATE_FORMAT);

        const targetUserId = process.env.JIRA_TARGET_USER_ID
        const query = `assignee = ${targetUserId} 
        and (
            (updatedDate >= '${startDateStr}' AND updatedDate < ${endDateStr}) 
            or (createdDate >= '${startDateStr}' AND createdDate < ${endDateStr})
        ) 
        order by updatedDate`;

        const results = await jiraService.jqlSearchIssues(query);

        const issues = results.issues.map(issue => ({
            title: issue.fields.summary,
            createdAt: moment(issue.fields.created),
            updatedAt: moment(issue.fields.updated),
            status: issue.fields.status.name,
            priority: issue.fields.priority.name,
            key: issue.key,
            link: `${process.env.JIRA_DOMAIN}/browse/${issue.key}`,
        }));

        return issues;
    }

}

const jiraService = new JiraService();

module.exports = jiraService;
