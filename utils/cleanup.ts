import * as fs from 'fs';
import * as path from 'path';
import { log, colors } from './logger';

/**
 * Cleans up old report files and screenshots
 * @param maxAgeDays Maximum age of files to keep (in days)
 */
export function cleanupReports(maxAgeDays: number = 0): void {
    const reportsDir = path.join(process.cwd(), 'reports');
    const screenshotsDir = path.join(reportsDir, 'screenshots');

    // Create directories if they don't exist
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
        log('Created reports directory', 0, colors.green);
    }

    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
        log('Created screenshots directory', 0, colors.green);
    }

    const now = new Date().getTime();
    const ageThreshold = maxAgeDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    // If maxAgeDays is 0, delete all files (for fresh run)
    if (maxAgeDays === 0) {
        log('Cleaning up all previous reports and screenshots...', 0, colors.yellow);

        // Delete screenshots
        if (fs.existsSync(screenshotsDir)) {
            const files = fs.readdirSync(screenshotsDir);
            for (const file of files) {
                fs.unlinkSync(path.join(screenshotsDir, file));
            }
            log(`Deleted ${files.length} screenshot files`, 0, colors.yellow);
        }

        // Delete log files and summaries in reports directory
        if (fs.existsSync(reportsDir)) {
            const files = fs.readdirSync(reportsDir).filter(
                file => file.startsWith('log_') || file.startsWith('summary_') || file.endsWith('.html')
            );

            for (const file of files) {
                fs.unlinkSync(path.join(reportsDir, file));
            }
            log(`Deleted ${files.length} report files`, 0, colors.yellow);
        }

        return;
    }

    // Otherwise, delete files older than the threshold
    log(`Cleaning up reports older than ${maxAgeDays} days...`, 0, colors.yellow);

    // Process screenshots
    if (fs.existsSync(screenshotsDir)) {
        const files = fs.readdirSync(screenshotsDir);
        let deletedCount = 0;

        for (const file of files) {
            const filePath = path.join(screenshotsDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtime.getTime() > ageThreshold) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            log(`Deleted ${deletedCount} old screenshot files`, 0, colors.yellow);
        }
    }

    // Process log files and summaries
    if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir).filter(
            file => file.startsWith('log_') || file.startsWith('summary_') || file.endsWith('.html')
        );

        let deletedCount = 0;

        for (const file of files) {
            const filePath = path.join(reportsDir, file);
            const stats = fs.statSync(filePath);

            if (now - stats.mtime.getTime() > ageThreshold) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            log(`Deleted ${deletedCount} old report files`, 0, colors.yellow);
        }
    }
}