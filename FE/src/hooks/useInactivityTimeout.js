import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track user inactivity and logout after timeout
 * @param {number} timeoutMinutes - Inactivity timeout in minutes (default: 30)
 * @param {function} onTimeout - Callback when timeout occurs
 */
export const useInactivityTimeout = (timeoutMinutes = 30, onTimeout) => {
  const timeoutRef = useRef(null);
  const activityTimeRef = useRef(Date.now());

  // Reset activity time
  const resetActivity = useCallback(() => {
    console.log('Activity detected - resetting inactivity timer');
    activityTimeRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      console.log(`User inactive for ${timeoutMinutes} minutes - logging out`);
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMs);
  }, [timeoutMinutes, onTimeout]);

  useEffect(() => {
    // List of user activity events
    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove'
    ];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });

    // Initialize timer
    resetActivity();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetActivity]);

  return {
    lastActivityTime: activityTimeRef.current,
    resetActivity
  };
};

export default useInactivityTimeout;
