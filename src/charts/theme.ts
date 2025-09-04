import { Chart } from 'chart.js';

export function setupChartTheme() {
  // Get CSS variables for theming
  const getCSSVariable = (variable: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };

  // Read theme colors from CSS variables
  const primaryColor = getCSSVariable('--primary') || 'hsl(222.2 84% 4.9%)';
  const mutedForeground = getCSSVariable('--muted-foreground') || 'hsl(215.4 16.3% 46.9%)';
  const borderColor = getCSSVariable('--border') || 'hsl(214.3 31.8% 91.4%)';
  const backgroundColor = getCSSVariable('--background') || 'hsl(0 0% 100%)';
  const foregroundColor = getCSSVariable('--foreground') || 'hsl(222.2 84% 4.9%)';

  // Set global Chart.js defaults
  Chart.defaults.font.family = getCSSVariable('--font-sans') || 'system-ui, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = mutedForeground;
  Chart.defaults.borderColor = borderColor;
  Chart.defaults.devicePixelRatio = window.devicePixelRatio || 1;
  Chart.defaults.parsing = false;
  Chart.defaults.responsive = true;
  Chart.defaults.maintainAspectRatio = false;

  // Set global grid and tick colors
  Chart.defaults.scale.grid.color = borderColor;
  Chart.defaults.scale.grid.borderColor = borderColor;
  Chart.defaults.scale.ticks.color = mutedForeground;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    Chart.defaults.animation = false;
    Chart.defaults.transitions = false;
  }

  // Listen for changes in reduced motion preference
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      Chart.defaults.animation = false;
      Chart.defaults.transitions = false;
    } else {
      Chart.defaults.animation = true;
      Chart.defaults.transitions = true;
    }
  });
}
