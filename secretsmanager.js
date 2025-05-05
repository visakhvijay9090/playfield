import { log, colors } from "./utils/logger";

// Get credentials directly from environment variable
export function getCredentials() {
  try {
    // Check if we're running in GitHub Actions (or any environment with the secret)
    if (process.env.CREDENTIALS_JSON) {
      log("Using credentials from environment variables", 0, colors.green);
      const credentials = JSON.parse(process.env.CREDENTIALS_JSON);
      return Object.entries(credentials);
    } else {
      // Local development warning
      log("No credentials found in environment variables.", 0, colors.yellow);
      log(
        "Please set CREDENTIALS_JSON environment variable.",
        0,
        colors.yellow
      );
      log(
        'Example: export CREDENTIALS_JSON=\'{"user1":{"username":"test@example.com","password":"pass"}}\'',
        0,
        colors.yellow
      );
      return [];
    }
  } catch (error) {
    log(`Error parsing credentials: ${error}`, 0, colors.red);
    return [];
  }
}

// Get website URL from environment variable or use default
export function getWebsiteUrl() {
  return process.env.NODEWEB || "https://www.eggg.co.uk";
}
