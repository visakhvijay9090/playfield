import * as fs from 'fs';
import * as path from 'path';
import { launchSessions } from './sessions/sessionManager';
import { log, colors } from './utils/logger';
import { cleanupReports } from './utils/cleanup';

// Load credentials from JSON file
function loadCredentials(): [string, { username: string; password: string }][] {
    try {
        const credentialsPath = path.join(__dirname, 'credentials.json');
        if (!fs.existsSync(credentialsPath)) {
            log('Credentials file not found. Creating a sample file...', 0, colors.yellow);

            // Create a sample credentials file
            const sampleCredentials = {
                "user1": {
                    "username": "testuser1@example.com",
                    "password": "password1"
                },
                "user2": {
                    "username": "testuser2@example.com",
                    "password": "password2"
                }
            };

            fs.writeFileSync(credentialsPath, JSON.stringify(sampleCredentials, null, 2));
            log(`Created sample credentials file at ${credentialsPath}`, 0, colors.green);
            log('Please update with real credentials and run again.', 0, colors.yellow);
            process.exit(1);
        }

        const rawData = fs.readFileSync(credentialsPath, 'utf8');
        const credentials = JSON.parse(rawData);

        // Convert to array of entries
        return Object.entries(credentials);
    } catch (error) {
        log(`Error loading credentials: ${error}`, 0, colors.red);
        process.exit(1);
    }
}

// Main function
async function main() {
    try {
        log('Starting automation...', 0, colors.blue);

        // Clean up old reports before starting
        cleanupReports(0); // 0 means delete all previous files

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