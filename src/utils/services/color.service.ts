import { RgbColor, RowColor } from 'src/utils/types/color.interfaces';
export class ColorService {
  private static readonly colors: string[] = [
    '#F4CCCC',
    '#ffff00',
    '#ff9900',
    '#f9cb9c',
    '#ffe599',
    '#EA9999',
    '#00ffff',
    '#00ff00',
    '#cfe2f3',
    '#00ff00',
    '#6d9eeb',
    '#fff2cc',
    '#00ff00',
    '#00ffff',
  ];

  static hexToRgb(hex: string): RgbColor {
    // Remove the hash symbol if it exists
    hex = hex.replace(/^#/, '');

    // If the hex code is shorthand (3 digits), expand it to 6 digits
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    // Parse the red, green, and blue components from the hex string
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convert each component to a value between 0 and 1
    return {
      red: r / 255,
      green: g / 255,
      blue: b / 255,
    };
  }

  static rowColors(start: number, end: number): RowColor[] {
    const result = [];

    // Loop through the columns and map them to the corresponding colors
    for (let i = start; i <= end; i++) {
      const colorIndex = i - start; // Get the corresponding color from the array
      const color = this.colors[colorIndex];

      if (color) {
        result.push({
          from: i,
          to: i,
          color: color,
        });
      }
    }

    return result;
  }
}
