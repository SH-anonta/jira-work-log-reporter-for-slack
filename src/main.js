require('dotenv').config({ path: '../.env'});
const jiraService = require('./services/jira-service');
const slackService = require("./services/slack-service");

async function  main() {
    const mentionUserName = process.env.SLACK_TARGET_USER_NAME;
    const totalWorkDuration = await jiraService.getWorkLogDurationToday();
    await slackService.sendMessageToChannel(`${mentionUserName} has logged ${totalWorkDuration} hours of work today`);
}

main().catch(err => {
    console.error(err);
});
