/**
 * Convert UTC timestamp to Sri Lankan time (UTC+5:30)
 */
export function formatSriLankanTime(timestamp: string | Date | number): string {
    try {
        const date = new Date(timestamp);

        // Format using Sri Lankan timezone (Asia/Colombo)
        return date.toLocaleString('en-US', {
            timeZone: 'Asia/Colombo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'N/A';
    }
}

/**
 * Convert UTC timestamp to Sri Lankan time - Time only
 */
export function formatSriLankanTimeOnly(timestamp: string | Date | number): string {
    try {
        const date = new Date(timestamp);

        // Format using Sri Lankan timezone (Asia/Colombo) - Time only
        return date.toLocaleString('en-US', {
            timeZone: 'Asia/Colombo',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'N/A';
    }
}

/**
 * Convert UTC timestamp to Sri Lankan date format
 */
export function formatSriLankanDate(timestamp: string | Date | number): string {
    try {
        const date = new Date(timestamp);

        // Format using Sri Lankan timezone (Asia/Colombo)
        return date.toLocaleString('en-US', {
            timeZone: 'Asia/Colombo',
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}
