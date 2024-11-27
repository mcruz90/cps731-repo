/**
 * Utility function to get the start and end dates of the current week.
 * Assumes the week starts on Sunday and ends on Saturday.
 * @returns {Object} - Contains 'start' and 'end' Date objects.
 */
export const getCurrentWeekDateRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };

/**
 * Formats a date to 'YYYY-MM-DD' string.
 * @param {Date|string} date - The date to format.
 * @returns {string} - Formatted date string.
 */
export const formatDate = (date) => {
    let dateObj;

    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
        if (isNaN(dateObj)) {
            console.error('Invalid date string provided to formatDate:', date);
            return '';
        }
    } else {
        console.error('Unsupported date type provided to formatDate:', date);
        return '';
    }

    return dateObj.toISOString().split('T')[0];
};

