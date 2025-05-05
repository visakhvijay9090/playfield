import { log, colors } from './logger';

/**
 * Retry an async action with exponential backoff
 * @param action Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param sessionId Session identifier for logging
 * @param baseDelay Base delay in ms between retries (doubles each retry)
 * @returns Result of the action
 */
export async function retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    sessionId: number = 0,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                log(`Retry attempt ${attempt}/${maxRetries}...`, sessionId, colors.yellow);
            }
            return await action();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                log(`All retry attempts failed: ${lastError.message}`, sessionId, colors.red);
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            log(`Action failed, retrying in ${delay}ms: ${lastError.message}`, sessionId, colors.yellow);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError || new Error('Retry failed with unknown error');
}