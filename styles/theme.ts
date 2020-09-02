const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
    PRIMARY_COLOR: '#00bbf9',
    SECONDARY_COLOR: '#00f5d4',
    SECONDARY_TINTED: '#19c2ab',
    WARNING_COLOR: '#fee440',
    DANGER_COLOR: '#e63946',
    DARK_COLOR: '#353535',
    LIGHT_COLOR: '#f8f9fa',
    FONT_SIZE_SMALL: 12,
    FONT_SIZE_MEDIUM: 14,
    FONT_SIZE_LARGE: 16,
    FONT_WEIGHT_LIGHT: 200,
    FONT_WEIGHT_MEDIUM: 600,
    FONT_WEIGHT_HEAVY: 800,
    light: {
        text: '#000',
        background: '#fff',
        tint: tintColorLight,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorLight,
      },
    dark: {
        text: '#fff',
        background: '#000',
        tint: tintColorDark,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorDark,
    },
    tintColorDark: tintColorDark,
    tintColorLight: tintColorLight
};