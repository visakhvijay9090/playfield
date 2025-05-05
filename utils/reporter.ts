import * as fs from 'fs';
import * as path from 'path';
import { log, colors } from './logger';

/**
 * Creates a visual HTML report from session data and screenshots
 * @param sessions Array of session information
 * @param startTime Start time of the automation run
 * @param endTime End time of the automation run
 */
export function createVisualReport(
    sessions: { id: number, username: string, success: boolean }[],
    startTime: Date,
    endTime: Date
): string {
    const reportDir = path.join(process.cwd(), 'reports');
    const screenshotsDir = path.join(reportDir, 'screenshots');
    const timestamp = startTime.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const reportPath = path.join(reportDir, `report_${timestamp}.html`);

    // Calculate run stats
    const successCount = sessions.filter(s => s.success).length;
    const failCount = sessions.length - successCount;
    const runTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds

    // Get log file content
    const logFile = fs.readdirSync(reportDir)
        .find(file => file.startsWith(`log_${timestamp}`));

    let logContent = '';
    if (logFile) {
        logContent = fs.readFileSync(path.join(reportDir, logFile), 'utf8');
    }

    // Process screenshots for each session
    const sessionScreenshots: Record<number, string[]> = {};

    if (fs.existsSync(screenshotsDir)) {
        const allScreenshots = fs.readdirSync(screenshotsDir);

        // Group screenshots by session
        for (const session of sessions) {
            const sessionId = session.id;
            const sessionFiles = allScreenshots
                .filter(file => file.startsWith(`session_${sessionId}_`))
                .sort((a, b) => {
                    // Extract timestamps from filenames
                    const timeA = a.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/)?.[1] || '';
                    const timeB = b.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/)?.[1] || '';
                    return timeA.localeCompare(timeB);
                });

            sessionScreenshots[sessionId] = sessionFiles;
        }
    }

    // Create HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automation Report ${timestamp}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            background-color: #3498db;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .summary {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
        }
        .summary-box {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            flex: 1;
            margin: 0 10px;
            text-align: center;
        }
        .summary-box h3 {
            margin-top: 0;
            color: #3498db;
        }
        .success-box {
            border-top: 4px solid #2ecc71;
        }
        .failure-box {
            border-top: 4px solid #e74c3c;
        }
        .time-box {
            border-top: 4px solid #f39c12;
        }
        .session-container {
            margin-top: 40px;
        }
        .session {
            background-color: white;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .session-header {
            padding: 15px;
            background-color: #34495e;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .session-success {
            background-color: #2ecc71;
        }
        .session-failed {
            background-color: #e74c3c;
        }
        .session-body {
            padding: 20px;
        }
        .session-screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .screenshot-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        .screenshot-img {
            width: 100%;
            height: auto;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .screenshot-img:hover {
            transform: scale(1.05);
        }
        .screenshot-caption {
            padding: 10px;
            background-color: #f9f9f9;
            text-align: center;
            font-size: 0.9em;
            color: #555;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .log-container {
            margin-top: 40px;
        }
        .log-box {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            max-height: 400px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            overflow: auto;
        }
        .modal-content {
            margin: auto;
            display: block;
            max-width: 90%;
            max-height: 90%;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
        .tabs {
            display: flex;
            background-color: #34495e;
            margin-bottom: 20px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
        }
        .tab {
            flex: 1;
            padding: 15px;
            text-align: center;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .tab.active {
            background-color: #3498db;
            font-weight: bold;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Automation Report</h1>
        <p>Run Time: ${startTime.toLocaleString()} - ${endTime.toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-box success-box">
            <h3>Success</h3>
            <p>${successCount} / ${sessions.length} sessions</p>
            <p>${Math.round((successCount / sessions.length) * 100)}%</p>
        </div>
        <div class="summary-box failure-box">
            <h3>Failures</h3>
            <p>${failCount} / ${sessions.length} sessions</p>
            <p>${Math.round((failCount / sessions.length) * 100)}%</p>
        </div>
        <div class="summary-box time-box">
            <h3>Total Run Time</h3>
            <p>${runTime.toFixed(2)} seconds</p>
        </div>
    </div>
    
    <div class="tabs">
        <div class="tab active" data-tab="sessions">Sessions</div>
        <div class="tab" data-tab="logs">Logs</div>
    </div>
    
    <div class="tab-content active" id="sessions-tab">
        <div class="session-container">
            ${sessions.map(session => {
        const screenshots = sessionScreenshots[session.id] || [];
        return `
                <div class="session">
                    <div class="session-header ${session.success ? 'session-success' : 'session-failed'}">
                        <h2>Session ${session.id}: ${session.username}</h2>
                        <span>${session.success ? 'SUCCESS' : 'FAILED'}</span>
                    </div>
                    <div class="session-body">
                        <h3>Screenshots (${screenshots.length})</h3>
                        <div class="session-screenshots">
                            ${screenshots.map(screenshot => {
            // Extract action name from filename
            const actionMatch = screenshot.match(/session_\d+_([^_]+)_/);
            const actionName = actionMatch ? actionMatch[1].replace(/_/g, ' ') : '';

            return `
                                <div class="screenshot-item">
                                    <img src="screenshots/${screenshot}" class="screenshot-img" onclick="openModal(this.src)">
                                    <div class="screenshot-caption">${actionName}</div>
                                </div>
                                `;
        }).join('')}
                        </div>
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    </div>
    
    <div class="tab-content" id="logs-tab">
        <div class="log-container">
            <h2>Execution Logs</h2>
            <div class="log-box">${logContent.replace(/\n/g, '<br>')}</div>
        </div>
    </div>
    
    <div id="imageModal" class="modal">
        <span class="close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImg">
    </div>
    
    <script>
        // Image modal
        function openModal(src) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImg');
            modal.style.display = 'flex';
            modalImg.src = src;
        }
        
        function closeModal() {
            document.getElementById('imageModal').style.display = 'none';
        }
        
        // Close modal when clicking outside the image
        window.onclick = function(event) {
            const modal = document.getElementById('imageModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
            });
        });
    </script>
</body>
</html>`;

    // Write HTML to file
    fs.writeFileSync(reportPath, html);

    log(`Visual report created: ${reportPath}`, 0, colors.green);
    return reportPath;
}

/**
 * Opens the HTML report in the default browser
 * @param reportPath Path to the HTML report file
 */
export function openReport(reportPath: string): void {
    const { exec } = require('child_process');
    let command;

    switch (process.platform) {
        case 'darwin': // macOS
            command = `open "${reportPath}"`;
            break;
        case 'win32': // Windows
            command = `start "" "${reportPath}"`;
            break;
        default: // Linux and others
            command = `xdg-open "${reportPath}"`;
    }

    exec(command, (error: any) => {
        if (error) {
            log(`Error opening report: ${error}`, 0, colors.red);
        } else {
            log(`Opened report in default browser`, 0, colors.green);
        }
    });
}