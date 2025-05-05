import { log, colors } from '../utils/logger';
import { retryAction } from '../utils/retry';

export async function launchSession(
    username: string,
    password: string,
    sessionId: number,
    context: any
): Promise<void> {
    try {
        log(`Launching session for ${username}...`, sessionId);

        const page = await context.newPage();

        log(`Navigating to https://www.latestdeals.co.uk...`, sessionId);
        await retryAction(async () => {
            await page.goto('https://www.latestdeals.co.uk', { timeout: 30000 });
        });

        log(`Session launched successfully for ${username}`, sessionId, colors.green);

        log(`Clicking "AGREE"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="AGREE"');
        });

        log(`Clicking "Join"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Join"');
        });

        log(`Clicking "Already a member? Login"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Already a member? Login"');
        });

        log(`Filling login form for ${username}...`, sessionId);
        await retryAction(async () => {
            await page.fill('input[autocomplete="username"]', username);
            await page.fill('input[autocomplete="current-password"]', password);
        });

        log(`Clicking "Continue"...`, sessionId);
        await retryAction(async () => {
            await page.click('text="Continue"');
        });

        let randomWaitTime = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        log(`Waiting for ${randomWaitTime} seconds after login...`, sessionId, colors.yellow);
        await page.waitForTimeout(randomWaitTime * 1000);

        log(`Navigating to https://www.latestdeals.co.uk/rate...`, sessionId);
        await retryAction(async () => {
            await page.goto('https://www.latestdeals.co.uk/rate', { timeout: 30000 });
        });

        randomWaitTime = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        log(`Waiting for ${randomWaitTime} seconds...`, sessionId, colors.yellow);
        await page.waitForTimeout(randomWaitTime * 1000);

        const randomTimes = Math.floor(Math.random() * (33 - 26 + 1)) + 26;
        log(`Starting button clicking (${randomTimes} times)...`, sessionId);
        await limitedRepeatClicking(page, randomTimes, sessionId);

        log(`Session completed for ${username}`, sessionId, colors.green);

        await page.close();
    } catch (error) {
        log(`Error: ${error}`, sessionId, colors.red);
    }
}

async function limitedRepeatClicking(page: any, times: number, sessionId: number): Promise<void> {
    for (let i = 0; i < times; i++) {
        log(`Clicking iteration ${i + 1}/${times}...`, sessionId);
        await repeatClicking(page, sessionId);
    }
}

async function repeatClicking(page: any, sessionId: number, maxIterations: number = 10, iteration: number = 0): Promise<void> {
    if (iteration >= maxIterations) return;

    await randomlyClickButton(page, sessionId);

    const randomDelay = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
    log(`Waiting for ${randomDelay / 1000} seconds before next click...`, sessionId, colors.yellow);
    await page.waitForTimeout(randomDelay);
    await repeatClicking(page, sessionId, maxIterations, iteration + 1);
}

async function randomlyClickButton(page: any, sessionId: number): Promise<void> {
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
        } else {
            log(`Button not found: ${targetSelector}`, sessionId, colors.yellow);
        }
    } catch (error) {
        log(`Error clicking button: ${error}`, sessionId, colors.red);
    }
}