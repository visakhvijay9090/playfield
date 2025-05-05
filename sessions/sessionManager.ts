import { chromium } from 'playwright';
import { launchSession } from './session';
import { log, colors } from '../utils/logger';
import { createVisualReport, openReport } from '../utils/reporter';

export async function launchSessions(sessionEntries: [string, { username: string; password: string }][]): Promise<void> {
    // Launch browser with options
    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-dev-shm-usage'] // Helps with memory issues in Docker/CI environments
    });

    const sessionResults: { id: number, username: string, success: boolean }[] = [];
    const startTime = new Date();

    log(`Starting automation run with ${sessionEntries.length} sessions`, 0, colors.blue);
    log(`Time started: ${startTime.toISOString()}`, 0);

    // Launch sessions concurrently
    const sessionPromises = sessionEntries.map(async ([_, { username, password }], index) => {
        const sessionId = index + 1;

        try {
            // Create a separate context for each session
            const context = await browser.newContext({
                viewport: { width: 1280, height: 800 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36'
            });

            // Launch session and capture result
            const success = await launchSession(username, password, sessionId, context);
            sessionResults.push({ id: sessionId, username, success });

            // Close context
            await context.close();
        } catch (error) {
            log(`Fatal error in session ${sessionId}: ${error}`, sessionId, colors.red);
            sessionResults.push({ id: sessionId, username, success: false });
        }
    });

    // Wait for all sessions to complete
    await Promise.all(sessionPromises);

    // Close browser
    await browser.close();

    // Calculate run time
    const endTime = new Date();
    const runTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

    log(`All sessions completed.`, 0, colors.green);
    log(`Total run time: ${runTime.toFixed(2)} seconds`, 0);

    // Create visual HTML report
    const reportPath = createVisualReport(sessionResults, startTime, endTime);

    // Open the report in the default browser
    //openReport(reportPath);
}