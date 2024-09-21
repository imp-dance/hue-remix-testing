import ColorConverter from "cie-rgb-color-converter";
import { Device, Group } from "panasonic-comfort-cloud-client";

export const xybToRGB = ColorConverter.xyBriToRgb;
export const rgbToXY = ColorConverter.rgbToXy;

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

/*** */

export function extractDeviceFromGroups(
  groups: Group[]
): Device {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (groups[0] as any)?._devices?.[0];
}
