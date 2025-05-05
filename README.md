# Web Automation with GitHub Actions

This project automates web interactions using Playwright and runs on GitHub Actions, with security in mind.

## Project Structure

- `index.js` - Main entry point
- `sessions/` - Contains session management code
- `utils/` - Utility functions for logging, cleanup, etc.
- `secretsManager.js` - Manages credentials and configuration securely

## Security Features

- **No credentials saved to disk**: All credentials are read directly from environment variables
- **Repository secrets**: Sensitive information is stored as GitHub repository secrets
- **No hardcoded values**: Website URL and login information are configurable through environment variables

## Setup Instructions

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Playwright browsers:
   ```
   npx playwright install --with-deps chromium
   ```
4. Set environment variables:

   ```bash
   # For Linux/macOS
   export CREDENTIALS_JSON='{"user1":{"username":"your-email@example.com","password":"your-password"}}'
   export NODEWEB='https://www.eggg.co.uk'

   # For Windows PowerShell
   $env:CREDENTIALS_JSON='{"user1":{"username":"your-email@example.com","password":"your-password"}}'
   $env:NODEWEB='https://www.eggg.co.uk'
   ```

5. Build the TypeScript code:

   ```
   npm run build
   ```

6. Run the application:
   ```
   npm start
   ```

### GitHub Actions Setup

This project is configured to run automatically via GitHub Actions. To set it up:

1. Go to your repository's Settings > Secrets and Variables > Actions
2. Add the following secrets:

   - `CREDENTIALS_JSON`: Your credentials in JSON format:
     ```json
     {
       "user1": {
         "username": "realuser1@example.com",
         "password": "realpassword1"
       },
       "user2": {
         "username": "realuser2@example.com",
         "password": "realpassword2"
       }
     }
     ```
   - `NODEWEB`: The website URL (e.g., `https://www.eggg.co.uk`)

3. The automation will run:
   - Automatically according to the schedule in `.github/workflows/automation.yml`
   - Manually when you trigger the workflow from the Actions tab

## Screenshots and Reports

Screenshots are saved during each run and uploaded as artifacts in GitHub Actions. You can download them from the Actions tab after each run.

## Security Notes

- Never commit any credentials or sensitive information to the repository
- Always use repository secrets for sensitive information
- This implementation avoids writing credentials to disk at any point
