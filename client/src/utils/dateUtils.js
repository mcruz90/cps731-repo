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
  if (!date) return '';
  
  // Handle both string dates and Date objects
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Validate the date
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }

  // Use UTC methods to prevent timezone issues
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

