require('dotenv').config({ path: '../.env'});
const logger = require("./utility/logger");
const reportService = require("./services/report-service");

const args = require("args-parser")(process.argv)


reportWorkLogHours().catch(err => {
    console.error(err);
    logger.error(err);
});

logger.info('Starting work log reporter');

async function  reportWorkLogHours() {
    const reportType = args['report-type'];

    switch (reportType) {
        case 'today':
            await reportService.sendTodayWorkLogsReport();
            break;
        case 'yesterday':
            await reportService.sendYesterdayWorkLogsReport();
            break;
        case 'current-week':
            await reportService.sendCurrentWeekWorkLogsReport();
            break;
        case 'today-issue-changes':
            await reportService.todayIssueUpdatesSummaryReport();
            break;
        default:
            throw Error(`Invalid report type: ${reportType}`);
    }
}
