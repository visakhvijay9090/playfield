import { log, colors, getScreenshotPath, saveScreenshot } from '../utils/logger';
import { retryAction } from '../utils/retry';
import { Page } from 'playwright';

export async function launchSession(
    username: string,
    password: string,
    sessionId: number,
    context: any
): Promise<boolean> {
    try {
        log(`Launching session for ${username}...`, sessionId);

        const page = await context.newPage();

        // Set viewport for consistent screenshots
        await page.setViewportSize({ width: 1280, height: 800 });

        const websiteUrl = process.env.NODEWEB;
        log(`Navigating to ${websiteUrl}...`, sessionId);
        await retryAction(async () => {
            await page.goto(websiteUrl!, { timeout: 30000 });
        });

        // Take screenshot after navigation
        //await takeScreenshot(page, sessionId, 'homepage');

        log(`Session launched successfully for ${username}`, sessionId, colors.green);

        log(`Clicking "AGREE"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="AGREE"');
        });
        //await takeScreenshot(page, sessionId, 'after_agree');

        log(`Clicking "Join"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Join"');
        });
        //await takeScreenshot(page, sessionId, 'join_page');

        log(`Clicking "Already a member? Login"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Already a member? Login"');
        });
        //await takeScreenshot(page, sessionId, 'login_form');

        log(`Filling login form for ${username}...`, sessionId);
        await retryAction(async () => {
            await page.fill('input[autocomplete="username"]', username);
            await page.fill('input[autocomplete="current-password"]', password);
        });
        //await takeScreenshot(page, sessionId, 'filled_form');

        log(`Clicking "Continue"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Continue"');
        });
        //await takeScreenshot(page, sessionId, 'after_login');

        let randomWaitTime = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        log(`Waiting for ${randomWaitTime} seconds after login...`, sessionId, colors.yellow);
        await page.waitForTimeout(randomWaitTime * 1000);

        log(`Navigating to ${websiteUrl}/rate...`, sessionId);
        await retryAction(async () => {
            await page.goto(`${websiteUrl}/rate`, { timeout: 30000 });
        });
        //await takeScreenshot(page, sessionId, 'rate_page');

        randomWaitTime = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        log(`Waiting for ${randomWaitTime} seconds...`, sessionId, colors.yellow);
        await page.waitForTimeout(randomWaitTime * 1000);

        const randomTimes = Math.floor(Math.random() * (33 - 26 + 1)) + 26;
        log(`Starting button clicking (${randomTimes} times)...`, sessionId);
        await limitedRepeatClicking(page, randomTimes, sessionId);

        log(`Session completed for ${username}`, sessionId, colors.green);
        //await takeScreenshot(page, sessionId, 'session_completed');

        // Close the page here after all screenshots are taken
        await page.close();
        return true; // Session successful
    } catch (error) {
        log(`Error: ${error}`, sessionId, colors.red);
        return false; // Session failed
    }
}

async function limitedRepeatClicking(page: any, times: number, sessionId: number): Promise<void> {
    for (let i = 0; i < times; i++) {
        log(`Clicking iteration ${i + 1}/${times}...`, sessionId);

        // Take screenshot every 5 iterations to avoid too many screenshots
        if (i % 5 === 0) {
            //await takeScreenshot(page, sessionId, `click_iteration_${i + 1}`);
        }

        const shouldExit = await repeatClicking(page, sessionId);
        if (shouldExit) break;
    }
}

async function repeatClicking(page: any, sessionId: number, maxIterations: number = 10, iteration: number = 0): Promise<boolean> {
    if (iteration >= maxIterations) return false;

    const shouldExit = await randomlyClickButton(page, sessionId);
    if (shouldExit) {
        log(`Exiting session ${sessionId}...`, sessionId, colors.green);
        //await takeScreenshot(page, sessionId, 'exit_condition_met');
        // Don't close the page here, let the parent function handle it
        return true; // Exit the session
    }

    const randomDelay = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
    log(`Waiting for ${randomDelay / 1000} seconds before next click...`, sessionId, colors.yellow);
    await page.waitForTimeout(randomDelay);

    if (iteration === maxIterations - 1) {
        //await takeScreenshot(page, sessionId, 'final_iteration');
    }

    return await repeatClicking(page, sessionId, maxIterations, iteration + 1);
}

async function randomlyClickButton(page: any, sessionId: number): Promise<boolean> {
    const buttonSelector1 = "#root > div > main > div > div > div > div:nth-child(4) > button:nth-child(1)";
    const buttonSelector2 = "#root > div > main > div > div > div > div:nth-child(4) > button:nth-child(2)";

    const buttonSelectors = [buttonSelector1, buttonSelector2];
    const randomIndex = Math.floor(Math.random() * buttonSelectors.length);
    const targetSelector = buttonSelectors[randomIndex];

    try {
        const button = await page.$(targetSelector);
        if (button) {
            await button.click();
            log(`Clicked button: ${targetSelector}`, sessionId, colors.green);
            //await takeScreenshot(page, sessionId, `button_click_${randomIndex + 1}`);

            // Check for the dynamic text "Earn more points in X hours/minutes/seconds" after clicking
            const dynamicTextRegex = /Earn more points in \d+ (hour?s?|minute?s?|second?s?)/;
            const selector = `//div[contains(text(), 'Earn more points in')]`; // Robust XPath

            try {
                const element = await page.waitForSelector(selector, { timeout: 5000 }); // Wait for 5 seconds
                if (element) {
                    const textContent = await element.textContent();
                    if (textContent && dynamicTextRegex.test(textContent)) {
                        log(`Dynamic text found: "${textContent}". Exiting session ${sessionId}...`, sessionId, colors.green);
                        //await takeScreenshot(page, sessionId, 'earn_more_points_found');
                        return true; // Indicate that the session should exit
                    }
                }
            } catch (error) {
                log(`Dynamic text not found.`, sessionId, colors.yellow);
            }
        } else {
            log(`Button not found: ${targetSelector}`, sessionId, colors.yellow);
            //await takeScreenshot(page, sessionId, 'button_not_found');
        }
    } catch (error) {
        log(`Error clicking button: ${error}`, sessionId, colors.red);
    }

    return false; // Continue the session
}

async function takeScreenshot(page: Page, sessionId: number, actionName: string): Promise<void> {
    try {
        console.log("skipping screenshot")
        // const screenshotPath = getScreenshotPath(sessionId, actionName);
        // const buffer = await page.screenshot();
        // saveScreenshot(buffer, screenshotPath);
    } catch (error) {
        log(`Failed to take screenshot: ${error}`, sessionId, colors.red);
    }
}
