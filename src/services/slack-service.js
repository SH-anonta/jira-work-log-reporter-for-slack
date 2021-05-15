const { WebClient, LogLevel } = require('@slack/web-api');
const logger = require('../utility/logger');

class SlackService {
    constructor() {
        this.setupSlackClient();
        this.channelId = process.env.SLACK_CHANNEL_ID;
    }

    setupSlackClient() {
        const token = process.env.SLACK_OAUTH_TOKEN;
        this.client = new WebClient(token, {
            logLevel: LogLevel.ERROR,
        });
    }

    async sendMessageToChannel(message) {
        const result = await this.client.chat.postMessage({
            channel: this.channelId,
            text: message,
            link_names: true,
        });

        logger.info('Posting work log report to slack', { result });
    }
}

const slackService = new SlackService();

module.exports = slackService;
