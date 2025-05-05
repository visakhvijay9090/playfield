import { launchSessions } from "./sessions/sessionManager";
import { log, colors } from "./utils/logger";
import { cleanupReports } from "./utils/cleanup";
import { getCredentials } from "./secretsManager.js";

// Main function
async function main() {
  try {
    log("Starting automation...", 0, colors.blue);

    // Clean up old reports before starting
    cleanupReports(0); // 0 means delete all previous files

    // Get credentials directly from environment variables
    const credentials = getCredentials();

    if (credentials.length === 0) {
      log("No credentials available. Exiting.", 0, colors.red);
      process.exit(1);
    }

    log(`Loaded ${credentials.length} user credentials`, 0);

    // Launch sessions
    await launchSessions(credentials);

    log("Automation completed successfully.", 0, colors.green);
  } catch (error) {
    log(`Fatal error: ${error}`, 0, colors.red);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  log(`Unhandled error: ${error}`, 0, colors.red);
  process.exit(1);
});
