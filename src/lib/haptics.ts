// Mobile Haptic Feedback & Audio Utility for Native App Feel

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  if (typeof window === 'undefined' || !navigator) return;

  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([15, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([25, 40, 25]);
          break;
        case 'error':
          navigator.vibrate([50, 60, 50, 60, 50]);
          break;
      }
    }
  } catch {
    // Graceful fallback if device permissions disallow vibration
  }
};
