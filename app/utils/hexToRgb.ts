function componentToHex(c: string | number) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function hexToRgb(hex: string) {
  const result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(
  r: string | number,
  g: string | number,
  b: string | number
) {
  return (
    "#" +
    componentToHex(r) +
    componentToHex(g) +
    componentToHex(b)
  );
}
