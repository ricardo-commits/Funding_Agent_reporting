// Color palette utility for Chart.js
// Provides vibrant, distinct colors for charts

// Predefined chart colors that work well together
const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

// Fallback colors if the main array is exhausted
const FALLBACK_COLORS = [
  '#1E40AF', // Dark Blue
  '#DC2626', // Dark Red
  '#059669', // Dark Green
  '#D97706', // Dark Yellow
  '#7C3AED', // Dark Purple
  '#0891B2', // Dark Cyan
  '#EA580C', // Dark Orange
  '#DB2777', // Dark Pink
  '#65A30D', // Dark Lime
  '#4F46E5', // Dark Indigo
  '#0F766E', // Dark Teal
  '#E11D48', // Dark Rose
];

/**
 * Get a series of colors for charts
 * @param count Number of colors needed
 * @returns Array of color strings
 */
export function getSeriesColours(count: number): string[] {
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i < CHART_COLORS.length) {
      colors.push(CHART_COLORS[i]);
    } else if (i < CHART_COLORS.length + FALLBACK_COLORS.length) {
      colors.push(FALLBACK_COLORS[i - CHART_COLORS.length]);
    } else {
      // Generate additional colors using HSL with good contrast
      const hue = (i * 137.508) % 360; // Golden angle approximation
      const saturation = 70 + (i % 20); // 70-90%
      const lightness = 50 + (i % 20);  // 50-70%
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
  }
  
  return colors;
}

/**
 * Get a single color by index
 * @param index Color index
 * @returns Color string
 */
export function getColor(index: number): string {
  if (index < CHART_COLORS.length) {
    return CHART_COLORS[index];
  } else if (index < CHART_COLORS.length + FALLBACK_COLORS.length) {
    return FALLBACK_COLORS[index - CHART_COLORS.length];
  }
  
  // Generate color using HSL
  const hue = (index * 137.508) % 360;
  const saturation = 70 + (index % 20);
  const lightness = 50 + (index % 20);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Create background color with opacity
 * @param color Base color
 * @param opacity Opacity (0-1)
 * @returns RGBA color string
 */
export function bg(color: string, opacity: number = 0.1): string {
  if (color.startsWith('hsl(')) {
    // Convert HSL to RGB for opacity support
    const hsl = color.match(/hsl\(([^)]+)\)/);
    if (hsl) {
      const [h, s, l] = hsl[1].split(',').map(x => parseFloat(x));
      const rgb = hslToRgb(h, s, l);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
}

/**
 * Create border color with opacity
 * @param color Base color
 * @param opacity Opacity (0-1)
 * @returns RGBA color string
 */
export function border(color: string, opacity: number = 0.8): string {
  return bg(color, opacity);
}

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}
