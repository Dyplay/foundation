import { writable, get } from 'svelte/store';

// Initialize the store with the saved theme or default to true (dark mode)
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const isDark = settings.darkMode ?? true;
        // Ensure DOM is in sync with stored value
        document.documentElement.classList.toggle('dark-mode', isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        return isDark;
      } catch (error) {
        console.error('Error parsing theme settings:', error);
      }
    }
  }
  return true;
};

// Create the store
const darkMode = writable(getInitialTheme());

// Subscribe to changes and update localStorage and DOM
if (typeof window !== 'undefined') {
  darkMode.subscribe((value) => {
    try {
      // Update localStorage
      const savedSettings = localStorage.getItem('user_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.darkMode = value;
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      // Update DOM
      requestAnimationFrame(() => {
        document.documentElement.classList.toggle('dark-mode', value);
        document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
      });
      
      // Log theme change for debugging
      console.log('Theme changed:', value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  });
}

// Helper function to get current theme synchronously
export const getCurrentTheme = () => get(darkMode);

export { darkMode }; 