// Smart contrast utilities for optimal readability
export interface ContrastConfig {
  primary: string;
  background: string;
  foreground: string;
  muted: string;
}

// WCAG AA compliance requires 4.5:1 contrast ratio for normal text
// WCAG AAA requires 7:1 contrast ratio for enhanced accessibility
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5
} as const;

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / (1/12)) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  // Parse HSL colors (format: "hsl(h, s%, l%)")
  const parseHsl = (hsl: string) => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };
  
  const [h1, s1, l1] = parseHsl(color1);
  const [h2, s2, l2] = parseHsl(color2);
  
  const [r1, g1, b1] = hslToRgb(h1, s1, l1);
  const [r2, g2, b2] = hslToRgb(h2, s2, l2);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (brighter + 0.05) / (darker + 0.05);
}

// Check if color combination meets WCAG standards
export function meetsWCAG(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
  const ratio = getContrastRatio(foreground, background);
  const required = level === 'AA' 
    ? (size === 'normal' ? CONTRAST_RATIOS.AA_NORMAL : CONTRAST_RATIOS.AA_LARGE)
    : (size === 'normal' ? CONTRAST_RATIOS.AAA_NORMAL : CONTRAST_RATIOS.AAA_LARGE);
  
  return ratio >= required;
}

// Generate optimal contrast colors for themes
export function getOptimalContrastColors(isDark: boolean): ContrastConfig {
  if (isDark) {
    return {
      primary: 'hsl(263, 70%, 50%)',
      background: 'hsl(224, 71%, 4%)',
      foreground: 'hsl(210, 20%, 98%)',
      muted: 'hsl(215, 28%, 17%)'
    };
  }
  
  return {
    primary: 'hsl(262, 83%, 58%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(224, 71%, 4%)',
    muted: 'hsl(220, 14%, 96%)'
  };
}

// Automatically adjust text color based on background
export function getAccessibleTextColor(backgroundColor: string): string {
  const lightText = 'hsl(210, 20%, 98%)';
  const darkText = 'hsl(224, 71%, 4%)';
  
  const lightRatio = getContrastRatio(lightText, backgroundColor);
  const darkRatio = getContrastRatio(darkText, backgroundColor);
  
  return lightRatio > darkRatio ? lightText : darkText;
}