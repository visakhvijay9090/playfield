import { launchSessions } from './sessions/sessionManager';
import { log, colors } from './utils/logger';
import { cleanupReports } from './utils/cleanup';

// Load credentials from environment variables
function loadCredentials(): [string, { username: string; password: string }][] {
    const credentials = [
        { username: process.env.USER1_USERNAME!, password: process.env.USER1_PASSWORD! },
        { username: process.env.USER2_USERNAME!, password: process.env.USER2_PASSWORD! },
        { username: process.env.USER3_USERNAME!, password: process.env.USER3_PASSWORD! },
        { username: process.env.USER4_USERNAME!, password: process.env.USER4_PASSWORD! }
    ];

    return Object.entries(credentials);
}

// Main function
async function main() {
    try {
        log('Starting automation...', 0, colors.blue);

        // Clean up old reports before starting
        // cleanupReports(0); // 0 means delete all previous files

        // Load credentials
        const credentials = loadCredentials();
        log(`Loaded ${credentials.length} user credentials`, 0);

        // Launch sessions
        await launchSessions(credentials);

        log('Automation completed successfully.', 0, colors.green);
    } catch (error) {
        log(`Fatal error: ${error}`, 0, colors.red);
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    log(`Unhandled error: ${error}`, 0, colors.red);
    process.exit(1);
});
