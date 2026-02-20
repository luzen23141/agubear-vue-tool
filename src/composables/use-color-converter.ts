import { ref } from 'vue';
import { colord, extend, type Colord } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';

// Extend colord
extend([cmykPlugin, namesPlugin]);

export function UseColorConverter() {
  // State
  const hexValue = ref('#2d9d6a'); // Internal source of truth for color state (picker)
  const hexInput = ref('#2d9d6a');
  const rgbInput = ref('rgb(45, 157, 106)');
  const hslInput = ref('hsl(153, 55%, 40%)');
  const cmykInput = ref('device-cmyk(71%, 0%, 32%, 38%)');

  // Sync functions
  const syncAll = (color: Colord) => {
    if (color.isValid()) {
      const hex = color.toHex();
      hexValue.value = hex;
      hexInput.value = hex;
      rgbInput.value = color.toRgbString();
      hslInput.value = color.toHslString();
      cmykInput.value = color.toCmykString();
    }
  };

  const updateFromPicker = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const c = colord(target.value);
    syncAll(c);
  };

  const updateFromHex = () => {
    const c = colord(hexInput.value);
    if (c.isValid()) syncAll(c);
  };

  const updateFromRgb = () => {
    const c = colord(rgbInput.value);
    if (c.isValid()) syncAll(c);
  };

  const updateFromHsl = () => {
    const c = colord(hslInput.value);
    if (c.isValid()) syncAll(c);
  };

  const updateFromCmyk = () => {
    const c = colord(cmykInput.value);
    if (c.isValid()) syncAll(c);
  };

  return {
    hexValue,
    hexInput,
    rgbInput,
    hslInput,
    cmykInput,
    updateFromPicker,
    updateFromHex,
    updateFromRgb,
    updateFromHsl,
    updateFromCmyk
  };
}
