import * as fs from 'fs';
import * as path from 'path';

// Define terminal colors
export const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',

    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m'
};

// Ensure log directory exists
const logDir = path.join(process.cwd(), 'reports');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create new log file for each run with timestamp
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const logFilePath = path.join(logDir, `log_${timestamp}.txt`);

// Create screenshot directory
const screenshotDir = path.join(logDir, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

export function log(message: string, sessionId: number = 0, color: string = colors.white): void {
    const timestamp = new Date().toISOString();
    const sessionPrefix = sessionId > 0 ? `[Session ${sessionId}] ` : '';

    // Console output with color
    console.log(`${color}${timestamp} ${sessionPrefix}${message}${colors.reset}`);

    // Log to file (without color codes)
    fs.appendFileSync(logFilePath, `${timestamp} ${sessionPrefix}${message}\n`);
}

export function getScreenshotPath(sessionId: number, actionName: string): string {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `session_${sessionId}_${actionName}_${timestamp}.png`;
    return path.join(screenshotDir, filename);
}

export function saveScreenshot(buffer: Buffer, path: string): void {
    fs.writeFileSync(path, buffer);
    log(`Screenshot saved: ${path}`, 0, colors.cyan);
}

export function createReportSummary(sessions: { id: number, username: string, success: boolean }[]): void {
    const summaryPath = path.join(logDir, `summary_${timestamp}.txt`);

    const successCount = sessions.filter(s => s.success).length;
    const failCount = sessions.length - successCount;

    const summary = [
        `==== AUTOMATION REPORT SUMMARY ====`,
        `Time: ${new Date().toISOString()}`,
        `Total Sessions: ${sessions.length}`,
        `Successful: ${successCount}`,
        `Failed: ${failCount}`,
        ``,
        `==== SESSION DETAILS ====`
    ];

    sessions.forEach(session => {
        summary.push(`Session ${session.id} (${session.username}): ${session.success ? 'Success' : 'Failed'}`);
    });

    fs.writeFileSync(summaryPath, summary.join('\n'));
    log(`Report summary saved: ${summaryPath}`, 0, colors.green);
}