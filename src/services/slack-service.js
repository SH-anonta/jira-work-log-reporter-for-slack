const { WebClient, LogLevel } = require("@slack/web-api");

class SlackService {
    constructor() {
        this.setupSlackClient();
        this.channelId = process.env.SLACK_CHANNEL_ID;
    }

    setupSlackClient() {
        const token = process.env.SLACK_OAUTH_TOKEN;
        this.client = new WebClient(token, {
            logLevel: LogLevel.DEBUG
        });
    }

    async sendMessageToChannel(message) {
        await this.client.chat.postMessage({
            channel: this.channelId,
            text: message,
        });
    }
}

const slackService = new SlackService();

module.exports = slackService;
